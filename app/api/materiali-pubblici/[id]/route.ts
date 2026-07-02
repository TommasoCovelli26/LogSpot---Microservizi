// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from 'next/server';
// Importa la funzione fetchActivityById dal modulo activities per recuperare una singola attività
import { fetchActivityById } from '@/lib/activities';

/**
 * Handler GET per l'endpoint /api/materiali-pubblici/[id]
 * Recupera i dettagli di una singola attività pubblica dato il suo ID.
 * Verifica che l'attività esista e che sia effettivamente pubblica (flag accessibilita = true).
 * Se l'attività non esiste o non è pubblica, restituisce errore 404.
 */
export async function GET(
  _req: Request,  // Richiesta non utilizzata (prefisso _ indica parametro ignored)
  { params }: { params: { id: string } }  // Parametri dinamici dell'URL (id dell'attività)
) {
  // Estrae l'id dell'attività dai parametri dinamici della route
  const { id } = params;

  try {
    // Chiama la funzione fetchActivityById per recuperare l'attività dal database
    const activity = await fetchActivityById(id);

    // Verifica che l'attività esista e che sia pubblica (flag accessibilita attivo)
    // Se non trovata o non pubblica, restituisce errore 404
    if (!activity || !activity.accessibilita) {
      return NextResponse.json({ error: 'Attività non trovata' }, { status: 404 });
    }

    // Restituisce l'oggetto con i dettagli dell'attività come risposta JSON
    return NextResponse.json({ activity });
  } catch (error) {
    // Logga l'errore e restituisce errore 500
    console.error('Errore recupero attività pubblica:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell’attività pubblica' },
      { status: 500 }
    );
  }
}
