import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Attivita from '@/models/Attivita';
import Esercizio from '@/models/Esercizio';
import Logopedista from '@/models/Logopedista';
import Paziente from '@/models/Paziente';

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

async function resolveActivityByExternalId(activityId: number) {
  const byCod = await Attivita.findOne({ cod: activityId }).select('_id cod').lean();
  if (byCod) return byCod;

  const candidates = await Attivita.find({}).select('_id cod').lean<any[]>();
  return candidates.find((item) => externalIdFromUnknown(item.cod ?? item._id) === activityId) || null;
}

/**
 * Handler POST per l'endpoint /api/esercizi/assign
 * Crea un nuovo esercizio assegnando un'attività a un paziente.
 * Riceve nel body JSON: cf (codice fiscale paziente), id_attivita (ID attività), pIva (P.IVA logopedista).
 * L'esercizio viene creato con stato 'non iniziato', durata 0 e esito 'nullo'.
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const cf = body.cf;
    const id_attivita = Number(body.id_attivita);
    const pIva = body.pIva || null;

    if (!cf || !id_attivita || !pIva) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const [patient, logopedista] = await Promise.all([
      Paziente.findOne({ cf }).select('_id').lean(),
      Logopedista.findOne({ pIva }).select('_id').lean(),
    ]);

    if (!patient || !logopedista) {
      return NextResponse.json({ error: 'Paziente o logopedista non trovato' }, { status: 404 });
    }

    const activity = await resolveActivityByExternalId(id_attivita);
    if (!activity?._id) {
      return NextResponse.json({ error: 'Attività non trovata' }, { status: 404 });
    }

    const created = await Esercizio.create({
      dataAssegnazione: new Date(),
      statoCompletamento: 'non iniziato',
      durata: 0,
      esito: 'nullo',
      attivita: activity._id,
      logopedista: logopedista._id,
      paziente: patient._id,
      id_attivita,
      id_logopedista: pIva,
      id_paziente: cf,
    });

    return NextResponse.json({ success: true, id: externalIdFromUnknown(created.id ?? created._id) });
  } catch (error) {
    console.error('Errore assegnazione esercizio', error);
    return NextResponse.json({ error: 'Errore DB' }, { status: 500 });
  }
}
