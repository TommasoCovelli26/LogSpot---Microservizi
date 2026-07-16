import { NextRequest, NextResponse } from 'next/server';
import { apiGet, apiPost } from '../../../../../lib/http/client';
import { SERVICES } from '../../../../../lib/config/services';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Ora il TerapiaController espone direttamente un array di Feedback
    const feedbacks = await apiGet<any[]>(`${SERVICES.THERAPY}/esercizi/${id}/feedback`).catch(() => []);

    const formatted = (feedbacks || []).map((fb: any) => ({
      cod: fb.id || `${id}-${fb.data}`,
      messaggio: fb.messaggio,
      data: fb.data || new Date().toISOString(),
      id_esercizio: id,
    }));

    // Più recenti prima
    formatted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dei feedback' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.messaggio || !body.messaggio.trim()) {
      return NextResponse.json({ error: 'Il messaggio è obbligatorio' }, { status: 400 });
    }

    // Il backend restituisce l'esercizio aggiornato, con la lista feedbacks aggiornata
    const updatedExercise = await apiPost<any>(`${SERVICES.THERAPY}/esercizi/${id}/feedback`, {
      messaggio: body.messaggio.trim()
    });

    const feedbacksList = updatedExercise.feedbacks || [];
    // L'ultimo elemento della lista è quello appena aggiunto
    const fb = feedbacksList[feedbacksList.length - 1];

    const newFeedback = {
      cod: fb?.id || Date.now(),
      messaggio: fb?.messaggio || body.messaggio.trim(),
      data: fb?.data || new Date().toISOString(),
      id_esercizio: id,
    };

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione del feedback' }, { status: 500 });
  }
}