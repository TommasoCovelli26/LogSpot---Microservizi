import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Esercizio from '@/models/Esercizio';
import Logopedista from '@/models/Logopedista';
import Paziente from '@/models/Paziente';
import { fetchAssignedExercises } from '@/lib/activities';

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

function toIsoString(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  return value.toISOString();
}

/**
 * Handler GET per l'endpoint /api/esercizi
 * Recupera la lista degli esercizi assegnati a un paziente.
 * Supporta due modalità:
 * - Con cf + pIva: restituisce gli esercizi assegnati da un logopedista specifico a un paziente (vista logopedista)
 * - Con solo cf: restituisce tutti gli esercizi di un paziente con supporto ricerca e filtri (vista paziente)
 * Parametri query string: cf, pIva, query (ricerca), filter (tutti/completati/in-corso)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cf = searchParams.get('cf');
  const pIva = searchParams.get('pIva');
  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'tutti';

  if (cf && pIva) {
    try {
      await connectToDatabase();

      const [logopedista, patient] = await Promise.all([
        Logopedista.findOne({ pIva }).select('_id').lean(),
        Paziente.findOne({ cf }).select('_id').lean(),
      ]);

      const patientConditions: any[] = [{ id_paziente: cf }];
      if (patient?._id) patientConditions.push({ paziente: patient._id });

      const logopedistaConditions: any[] = [{ id_logopedista: pIva }];
      if (logopedista?._id) logopedistaConditions.push({ logopedista: logopedista._id });

      const rows = await Esercizio.find({
        $and: [{ $or: patientConditions }, { $or: logopedistaConditions }],
      })
        .populate({ path: 'attivita', select: 'titolo _id cod' })
        .sort({ dataAssegnazione: -1 })
        .lean<any[]>();

      const mapped = rows.map((exercise) => ({
        id: externalIdFromUnknown(exercise.id ?? exercise._id),
        titolo: exercise.attivita?.titolo || '',
        dataAssegnazione: toIsoString(exercise.dataAssegnazione),
        statoCompletamento: exercise.statoCompletamento ?? null,
        esito: exercise.esito ?? null,
      }));

      return NextResponse.json(mapped);
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del logopedista' },
        { status: 500 }
      );
    }
  }

  if (cf) {
    try {
      const rows = await fetchAssignedExercises(cf, query, filter);
      return NextResponse.json(rows);
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del paziente' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Parametri mancanti' },
    { status: 400 }
  );
}
