import { NextRequest, NextResponse } from 'next/server';
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

async function resolveExerciseByExternalId(exerciseId: number) {
  const byLegacyId = await Esercizio.findOne({ id: exerciseId })
    .select('_id id paziente id_paziente feedback')
    .populate({ path: 'paziente', select: 'cf' })
    .lean<any>();

  if (byLegacyId) return byLegacyId;

  const candidates = await Esercizio.find({})
    .select('_id id paziente id_paziente feedback')
    .populate({ path: 'paziente', select: 'cf' })
    .lean<any[]>();

  return candidates.find((item) => externalIdFromUnknown(item.id ?? item._id) === exerciseId) || null;
}

/**
 * Handler GET per l'endpoint /api/esercizi/[id]/feedback
 * Recupera tutti i feedback associati a un esercizio specifico.
 * Il parametro [id] rappresenta l'ID dell'esercizio.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'ID esercizio non valido' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const exercise = await resolveExerciseByExternalId(exerciseId);
    if (!exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    const feedback = exercise.feedback?.messaggio
      ? [{
          cod: externalIdFromUnknown(exercise.feedback._id),
          messaggio: exercise.feedback.messaggio,
          data: exercise.feedback.data
            ? new Date(exercise.feedback.data).toISOString()
            : new Date().toISOString(),
          id_paziente: exercise.paziente?.cf || exercise.id_paziente || '',
          id_esercizio: externalIdFromUnknown(exercise.id ?? exercise._id),
        }]
      : [];

    const feedbacks = feedback.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Errore nel recupero dei feedback:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei feedback' },
      { status: 500 }
    );
  }
}

/**
 * Handler POST per l'endpoint /api/esercizi/[id]/feedback
 * Crea un nuovo feedback per un esercizio specifico.
 * Riceve nel body JSON il campo 'messaggio' con il testo del feedback.
 * Il paziente autore viene determinato automaticamente dall'esercizio associato.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'ID esercizio non valido' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { messaggio } = body;

    if (!messaggio || !messaggio.trim()) {
      return NextResponse.json(
        { error: 'Il messaggio è obbligatorio' },
        { status: 400 }
      );
    }

    const exercise = await resolveExerciseByExternalId(exerciseId);
    if (!exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    await Esercizio.updateOne(
      { _id: exercise._id },
      {
        $set: {
          feedback: {
            messaggio: messaggio.trim(),
            data: new Date(),
          },
        },
      }
    );

    const updatedExercise = await Esercizio.findById(exercise._id)
      .select('_id id feedback id_paziente paziente')
      .populate({ path: 'paziente', select: 'cf' })
      .lean<any>();

    const newFeedback = {
      cod: externalIdFromUnknown(updatedExercise?.feedback?._id),
      messaggio: updatedExercise?.feedback?.messaggio || messaggio.trim(),
      data: updatedExercise?.feedback?.data
        ? new Date(updatedExercise.feedback.data).toISOString()
        : new Date().toISOString(),
      id_paziente: updatedExercise?.paziente?.cf || updatedExercise?.id_paziente || '',
      id_esercizio: externalIdFromUnknown(updatedExercise?.id ?? updatedExercise?._id),
    };

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione del feedback:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del feedback' },
      { status: 500 }
    );
  }
}
