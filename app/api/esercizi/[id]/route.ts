import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Esercizio from '@/models/Esercizio';

function externalIdFromUnknown(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
    if (mongoose.isValidObjectId(value)) return Number.parseInt(value.slice(-8), 16);
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return Number.parseInt(value.toString().slice(-8), 16);
  }
  return 0;
}

function buildExerciseClauses(id: string): any[] {
  const clauses: any[] = [];
  const numeric = Number.parseInt(id, 10);
  if (Number.isFinite(numeric)) clauses.push({ id: numeric });
  if (mongoose.isValidObjectId(id)) clauses.push({ _id: new mongoose.Types.ObjectId(id) });
  return clauses;
}

function normalizeImage(value: unknown): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean).join('|');
  return String(value);
}

function normalizePathologies(value: unknown): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean).join(',');
  return String(value);
}

/**
 * Handler GET per l'endpoint /api/esercizi/[id]
 * Recupera i dettagli completi di un esercizio specifico, inclusi i dati dell'attività associata.
 * Il parametro [id] viene estratto dall'URL dinamico.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const clauses = buildExerciseClauses(id);
    if (clauses.length === 0) {
      return NextResponse.json({ error: 'Esercizio non trovato' }, { status: 404 });
    }

    let exercise = await Esercizio.findOne({ $or: clauses })
      .populate({ path: 'attivita', select: 'titolo descrizione istruzioni immagini immagine fasciaEta patologie cod _id' })
      .lean<any>();

    if (!exercise) {
      const all = await Esercizio.find({})
        .populate({ path: 'attivita', select: 'titolo descrizione istruzioni immagini immagine fasciaEta patologie cod _id' })
        .lean<any[]>();

      const externalId = Number.parseInt(id, 10);
      if (Number.isFinite(externalId)) {
        exercise = all.find((item) => externalIdFromUnknown(item.id ?? item._id) === externalId) || null;
      }
    }

    if (!exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    const activity = exercise.attivita || {};

    return NextResponse.json({
      id: externalIdFromUnknown(exercise.id ?? exercise._id),
      dataAssegnazione: exercise.dataAssegnazione
        ? new Date(exercise.dataAssegnazione).toISOString()
        : null,
      statoCompletamento: exercise.statoCompletamento ?? null,
      durata: exercise.durata ?? null,
      esito: exercise.esito ?? null,
      titolo: activity.titolo || '',
      descrizione: activity.descrizione || '',
      istruzioni: activity.istruzioni || '',
      immagine: normalizeImage(activity.immagini ?? activity.immagine),
      fasciaEta: Number(activity.fasciaEta || 0),
      patologie: normalizePathologies(activity.patologie),
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'esercizio' },
      { status: 500 }
    );
  }
}

/**
 * Handler PATCH per l'endpoint /api/esercizi/[id]
 * Aggiorna parzialmente un esercizio: stato di completamento e/o durata.
 * Supporta aggiornamento di uno o entrambi i campi.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(body, 'statoCompletamento')) {
      updates.statoCompletamento = body.statoCompletamento ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'durata')) {
      updates.durata = body.durata ?? null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Nessun campo da aggiornare' },
        { status: 400 }
      );
    }

    const clauses = buildExerciseClauses(id);
    let updateResult = clauses.length
      ? await Esercizio.updateOne({ $or: clauses }, { $set: updates })
      : { matchedCount: 0 };

    if (updateResult.matchedCount === 0) {
      const numericId = Number.parseInt(id, 10);
      if (Number.isFinite(numericId)) {
        const candidates = await Esercizio.find({}).select('_id id').lean<any[]>();
        const target = candidates.find((item) => externalIdFromUnknown(item.id ?? item._id) === numericId);
        if (target?._id) {
          updateResult = await Esercizio.updateOne({ _id: target._id }, { $set: updates });
        }
      }
    }

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stato aggiornato con successo'
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dello stato' },
      { status: 500 }
    );
  }
}
