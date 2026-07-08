import { NextRequest, NextResponse } from 'next/server';
import { apiGet } from '../../../../../lib/http/client';
import { SERVICES } from '../../../../../lib/config/services';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const pIva = searchParams.get('pIva');

    if (!id || !pIva) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    // Recuperiamo tutti gli esercizi del logopedista
    const exercises = await apiGet<any[]>(`${SERVICES.THERAPY}/logopedisti/${pIva}/esercizi`);

    // Estraiamo i codici fiscali dei pazienti a cui è già stata assegnata QUESTA attività
    const assignedCFs = Array.from(
      new Set(
        exercises
          .filter(e => e.attivitaId === id || e.id_attivita?.toString() === id)
          .map(e => e.pazienteId || e.id_paziente)
          .filter(Boolean)
      )
    );

    return NextResponse.json({ assignedCFs });
  } catch (error) {
    console.error('Errore API recupero assegnazioni:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle assegnazioni' }, { status: 500 });
  }
}