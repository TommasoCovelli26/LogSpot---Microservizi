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
    if (exercise.attivita || exercise.attivitaId || exercise.id_attivita) {
      const actId = exercise.attivita || exercise.attivitaId || exercise.id_attivita;
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

    // Recupera l'esercizio esistente per non perdere gli altri campi richiesti dal backend
    const existing = await apiGet<any>(`${SERVICES.THERAPY}/esercizi/${id}`);

    const updates: any = {
      attivita: existing.attivita,
      logopedista: existing.logopedista,
      paziente: existing.paziente,
      durata: existing.durata ?? 0,
      statoCompletamento: existing.statoCompletamento,
    };

    if (body.statoCompletamento !== undefined) {
      const normalized = String(body.statoCompletamento).toUpperCase();
      updates.statoCompletamento = normalized === 'COMPLETATO' ? 'COMPLETATO' : 'DA_SVOLGERE';
    }
    if (body.durata !== undefined) updates.durata = body.durata;

    await apiPut(`${SERVICES.THERAPY}/esercizi/${id}`, updates);

    return NextResponse.json({ success: true, message: 'Stato aggiornato con successo' });
  } catch (error) {
    console.error('Errore PATCH esercizio:', error);
    return NextResponse.json({ error: "Errore nell'aggiornamento dello stato" }, { status: 500 });
  }
}