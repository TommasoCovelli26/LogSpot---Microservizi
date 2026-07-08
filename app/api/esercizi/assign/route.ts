import { NextResponse } from 'next/server';
import { apiPost } from '../../../../lib/http/client';
import { SERVICES } from '../../../../lib/config/services';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cf, id_attivita, pIva } = body;

    if (!cf || !id_attivita || !pIva) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    // Effettua la POST a Terapia-Service. Il payload mappa l'AssignExerciseRequest in Java
    const created = await apiPost<any>(`${SERVICES.THERAPY}/esercizi`, {
      pazienteId: cf,
      attivitaId: id_attivita.toString(),
      logopedistaId: pIva
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error) {
    console.error('Errore assegnazione esercizio API:', error);
    return NextResponse.json({ error: 'Errore API Terapia' }, { status: 500 });
  }
}