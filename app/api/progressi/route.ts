import { NextResponse } from 'next/server';
import { fetchAssignedExercises } from '@/lib/activities';

/**
 * Handler GET per l'endpoint /api/progressi
 * Recupera tutti gli esercizi di un paziente con il titolo dell'attività associata,
 * utile per visualizzare la pagina dei progressi del paziente.
 * Parametro query string: cf = Codice Fiscale del paziente
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cf = searchParams.get('cf');

  if (!cf) {
    return NextResponse.json({ error: 'Codice Fiscale mancante' }, { status: 400 });
  }

  try {
    const rows = await fetchAssignedExercises(cf, '', 'tutti');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei progressi' },
      { status: 500 }
    );
  }
}