import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Attivita from '@/models/Attivita';
import Esercizio from '@/models/Esercizio';
import Logopedista from '@/models/Logopedista';

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
 * Handler GET per l'endpoint /api/esercizi/assign/[id]
 * Recupera la lista dei codici fiscali (CF) dei pazienti a cui una specifica attività
 * è già stata assegnata come esercizio da un determinato logopedista.
 * Parametro URL: [id] = ID dell'attività
 * Parametro query string: pIva = P.IVA del logopedista
 * Usato per determinare quali pazienti hanno già l'esercizio assegnato (es. per disabilitare
 * il pulsante di assegnazione nella UI).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const pIva = searchParams.get('pIva');

    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: 'ID attività non valido' },
        { status: 400 }
      );
    }

    if (!pIva) {
      return NextResponse.json(
        { error: 'pIva non fornita' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const [activity, logopedista] = await Promise.all([
      resolveActivityByExternalId(activityId),
      Logopedista.findOne({ pIva }).select('_id').lean(),
    ]);

    if (!activity?._id || !logopedista?._id) {
      return NextResponse.json({ assignedCFs: [] });
    }

    const assignedPatients = await Esercizio.find({
      $and: [
        { $or: [{ attivita: activity._id }, { id_attivita: activityId }] },
        { $or: [{ logopedista: logopedista._id }, { id_logopedista: pIva }] },
      ],
    })
      .populate({ path: 'paziente', select: 'cf' })
      .select('id_paziente paziente')
      .lean<any[]>();

    const assignedCFs = Array.from(
      new Set(
        assignedPatients
          .map((item) => item.paziente?.cf || item.id_paziente)
          .filter((cfValue): cfValue is string => Boolean(cfValue))
      )
    );

    return NextResponse.json({ assignedCFs });
  } catch (error) {
    console.error('Errore nel recupero delle assegnazioni:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle assegnazioni' },
      { status: 500 }
    );
  }
}
