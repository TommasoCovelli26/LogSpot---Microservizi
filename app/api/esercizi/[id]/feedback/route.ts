import { NextRequest, NextResponse } from 'next/server';
import { apiGet, apiPost } from '../../../../../lib/http/client';
import { SERVICES } from '../../../../../lib/config/services';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Il TerapiaController espone l'oggetto Feedback se esiste
    const feedback = await apiGet<any>(`${SERVICES.THERAPY}/esercizi/${id}/feedback`).catch(() => null);

    if (!feedback || !feedback.messaggio) {
      return NextResponse.json([]);
    }

    // Formattiamo il dato come se lo aspetta il frontend
    const formattedFeedback = [{
      cod: feedback.id || Date.now(),
      messaggio: feedback.messaggio,
      data: feedback.data || new Date().toISOString(),
      id_paziente: feedback.pazienteId || '', 
      id_esercizio: Number(id),
    }];

    return NextResponse.json(formattedFeedback);
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

    // Chiamiamo il TerapiaService passando l'oggetto FeedbackRequest
    const updatedExercise = await apiPost<any>(`${SERVICES.THERAPY}/esercizi/${id}/feedback`, {
       messaggio: body.messaggio.trim()
    });

    const fb = updatedExercise.feedback;
    const newFeedback = {
      cod: fb?.id || Date.now(),
      messaggio: fb?.messaggio || body.messaggio.trim(),
      data: fb?.data || new Date().toISOString(),
      id_paziente: updatedExercise.pazienteId || '',
      id_esercizio: Number(id),
    };

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione del feedback' }, { status: 500 });
  }
}