import { NextResponse } from 'next/server';
import { apiPost } from '../../../../lib/http/client';
import { SERVICES } from '../../../../lib/config/services';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const patientCf = body.cf ?? body.paziente ?? body.pazienteId;
    const activityId = body.id_attivita ?? body.attivita ?? body.attivitaId;
    const therapistId = body.pIva ?? body.logopedista ?? body.logopedistaId;
    const duration = Number(body.durata ?? 0);

    if (!patientCf || !activityId || !therapistId || Number.isNaN(duration)) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    // Effettua la POST al Therapy Service nel formato atteso dal backend Java
    const created = await apiPost<any>(`${SERVICES.THERAPY}/esercizi`, {
      paziente: String(patientCf),
      attivita: String(activityId),
      logopedista: String(therapistId),
      durata: duration
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error) {
    console.error('Errore assegnazione esercizio API:', error);
    return NextResponse.json({ error: 'Errore API Terapia' }, { status: 500 });
  }
}