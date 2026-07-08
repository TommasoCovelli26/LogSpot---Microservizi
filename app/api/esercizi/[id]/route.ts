import { NextResponse } from 'next/server';
import { apiGet, apiPut } from '../../../../lib/http/client';
import { SERVICES } from '../../../../lib/config/services';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Recupera l'esercizio dal Terapia Service
    const exercise = await apiGet<any>(`${SERVICES.THERAPY}/esercizi/${id}`);
    
    // Recupera i dettagli dell'attività collegata dal Catalog Service
    let activityDetails = {} as any;
    if (exercise.attivitaId || exercise.id_attivita) {
      const actId = exercise.attivitaId || exercise.id_attivita;
      activityDetails = await apiGet<any>(`${SERVICES.CATALOG}/${actId}`).catch(() => ({}));
    }

    return NextResponse.json({
      id: exercise.id,
      dataAssegnazione: exercise.dataAssegnazione,
      statoCompletamento: exercise.statoCompletamento,
      durata: exercise.durata,
      esito: exercise.esito,
      // Uniamo con i dati recuperati dal catalogo
      titolo: activityDetails.titolo || exercise.titolo || '',
      descrizione: activityDetails.descrizione || '',
      istruzioni: activityDetails.istruzioni || '',
      immagine: Array.isArray(activityDetails.immagini) ? activityDetails.immagini.join('|') : (activityDetails.immagine || ''),
      fasciaEta: Number(activityDetails.fasciaEta || 0),
      patologie: Array.isArray(activityDetails.patologie) ? activityDetails.patologie.join(',') : (activityDetails.patologie || ''),
    });
  } catch (error) {
    return NextResponse.json({ error: "Errore nel recupero dell'esercizio" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Costruiamo il payload per UpdateExerciseRequest
    const updates: any = {};
    if (body.statoCompletamento !== undefined) updates.statoCompletamento = body.statoCompletamento;
    if (body.durata !== undefined) updates.durata = body.durata;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }

    await apiPut(`${SERVICES.THERAPY}/esercizi/${id}`, updates);

    return NextResponse.json({ success: true, message: 'Stato aggiornato con successo' });
  } catch (error) {
    return NextResponse.json({ error: "Errore nell'aggiornamento dello stato" }, { status: 500 });
  }
}