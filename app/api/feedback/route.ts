import { NextRequest, NextResponse } from 'next/server';
import { apiGet } from '../../../lib/http/client';
import { SERVICES } from '../../../lib/config/services';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const logopedistaId = searchParams.get('pIva'); // in realtà è l'id Mongo reale

    if (!logopedistaId) {
      return NextResponse.json({ error: 'Parametro mancante' }, { status: 400 });
    }

    const exercises = await apiGet<any[]>(`${SERVICES.THERAPY}/logopedisti/${logopedistaId}/esercizi`);

    // Costruisce una lista piatta: un elemento per ogni feedback di ogni esercizio
    const flatFeedbacks: { exercise: any; feedback: any }[] = [];
    for (const e of exercises) {
      const list = e.feedbacks || [];
      for (const fb of list) {
        flatFeedbacks.push({ exercise: e, feedback: fb });
      }
    }

    const feedbacks = await Promise.all(
      flatFeedbacks.map(async ({ exercise, feedback }) => {
        const activityId = exercise.attivita || exercise.attivitaId || exercise.id_attivita;
        const pazienteCf = exercise.paziente || exercise.pazienteId || exercise.id_paziente || '';

        const [activityDetails, pazienteDetails] = await Promise.all([
          activityId
            ? apiGet<any>(`${SERVICES.CATALOG}/${activityId}`).catch(() => ({}))
            : Promise.resolve({} as any),
          pazienteCf
            ? apiGet<any>(`${SERVICES.USER}/paziente/${pazienteCf}`).catch(() => ({}))
            : Promise.resolve({} as any),
        ]);

        return {
          cod: feedback.id,
          messaggio: feedback.messaggio,
          data: feedback.data || new Date().toISOString(),
          id_paziente: pazienteCf,
          id_esercizio: exercise.id,
          titolo_esercizio: activityDetails.titolo || 'Esercizio',
          cognome_paziente: pazienteDetails.cognome || '',
          nome_paziente: pazienteDetails.nome || '',
        };
      })
    );

    feedbacks.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Errore recupero feedback:', error);
    return NextResponse.json({ error: 'Errore nel recupero dei feedback' }, { status: 500 });
  }
}