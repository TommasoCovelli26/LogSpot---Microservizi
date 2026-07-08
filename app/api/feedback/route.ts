import { NextRequest, NextResponse } from 'next/server';
import { apiGet } from '../../../lib/http/client';
import { SERVICES } from '../../../lib/config/services';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pIva = searchParams.get('pIva');

    if (!pIva) {
      return NextResponse.json({ error: 'pIva non fornita' }, { status: 400 });
    }

    // Richiediamo tutti gli esercizi assegnati da questo logopedista
    const exercises = await apiGet<any[]>(`${SERVICES.THERAPY}/logopedisti/${pIva}/esercizi`);

    // Mappiamo ed estraiamo solo quelli che possiedono un feedback
    const feedbacks = exercises
      .filter(e => e.feedback && e.feedback.messaggio)
      .map(e => ({
         cod: e.feedback.id || Date.now(),
         messaggio: e.feedback.messaggio,
         data: e.feedback.data || new Date().toISOString(),
         id_paziente: e.pazienteId || '',
         id_esercizio: e.id,
         titolo_esercizio: e.titolo || 'Esercizio',
         cognome_paziente: e.pazienteCognome || e.pazienteId || 'Paziente',
         nome_paziente: e.pazienteNome || '',
      }))
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json(feedbacks);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dei feedback' }, { status: 500 });
  }
}