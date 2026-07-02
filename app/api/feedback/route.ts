import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
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

/**
 * Handler GET per l'endpoint /api/feedback
 * Recupera tutti i feedback relativi agli esercizi assegnati da un determinato logopedista.
 * Esegue un multi-JOIN su Feedback, Esercizio, Attivita e Paziente per arricchire
 * ogni feedback con il titolo dell'esercizio e il nome/cognome del paziente.
 * Parametro query string: pIva = P.IVA del logopedista
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pIva = searchParams.get('pIva');

    if (!pIva) {
      return NextResponse.json(
        { error: 'pIva non fornita' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const logopedista = await Logopedista.findOne({ pIva }).select('_id').lean();

    const orClauses: any[] = [];
    if (logopedista?._id) orClauses.push({ logopedista: logopedista._id });
    orClauses.push({ id_logopedista: pIva });

    const exercises = await Esercizio.find({
      $or: orClauses,
    })
      .populate({ path: 'attivita', select: 'titolo' })
      .populate({ path: 'paziente', select: 'cf nome cognome' })
      .select('id feedback id_paziente attivita paziente')
      .lean<any[]>();

    const feedbacks = exercises
      .filter((exercise) => exercise.feedback?.messaggio)
      .map((exercise) => ({
        cod: externalIdFromUnknown(exercise.feedback?._id),
        messaggio: exercise.feedback?.messaggio || '',
        data: exercise.feedback?.data
          ? new Date(exercise.feedback.data).toISOString()
          : new Date().toISOString(),
        id_paziente: exercise.paziente?.cf || exercise.id_paziente || '',
        id_esercizio: externalIdFromUnknown(exercise.id ?? exercise._id),
        titolo_esercizio: exercise.attivita?.titolo || '',
        cognome_paziente: exercise.paziente?.cognome || '',
        nome_paziente: exercise.paziente?.nome || '',
      }))
      .sort(
        (a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
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
