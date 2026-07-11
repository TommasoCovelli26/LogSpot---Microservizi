// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from 'next/server';
// Importa la funzione fetchPublicActivities dal modulo activities per recuperare le attività pubbliche
import { fetchPublicActivities } from '@/lib/activities';

/**
 * Handler GET per l'endpoint /api/materiali-pubblici
 * Recupera la lista delle attività pubbliche (accessibili a tutti i logopedisti) con supporto
 * per ricerca testuale, filtri per ordinamento, fascia d'età e patologie.
 * Delega la logica di recupero alla funzione fetchPublicActivities del modulo activities.
 * Parametri query string:
 * - pIva: P.IVA del logopedista (obbligatorio, per escludere le proprie attività)
 * - query: termine di ricerca (default: stringa vuota)
 * - filter: tipo di ordinamento (default: 'recenti')
 * - age: fascia d'età (opzionale, numerico)
 * - pathologies: patologie separate da virgola (opzionale)
 */
export async function GET(req: Request) {
  // Estrae i parametri dalla query string dell'URL
  const { searchParams } = new URL(req.url);

  // Legge la P.IVA del logopedista dalla query string
  const pIva = searchParams.get('pIva');
  // Legge il termine di ricerca dalla query string (default: stringa vuota)
  const query = searchParams.get('query') || '';
  // Legge il filtro di ordinamento dalla query string (default: 'recenti')
  const filter = searchParams.get('filter') || 'recenti';
  // Legge il parametro fascia d'età dalla query string (opzionale)
  const ageParam = searchParams.get('age');
  // Legge il parametro patologie dalla query string (opzionale, stringa con valori separati da virgola)
  const pathologiesParam = searchParams.get('pathologies');

  // Converte il parametro età da stringa a numero (undefined se non fornito)
  const age = ageParam ? Number(ageParam) : undefined;
  // Converte il parametro patologie da stringa CSV a array di stringhe (undefined se non fornito)
  // Splitta per virgola, rimuove spazi, e filtra eventuali stringhe vuote
  const pathologies = pathologiesParam
    ? pathologiesParam.split(',').map((p) => p.trim()).filter(Boolean)
    : undefined;

  try {
    // Chiama la funzione fetchPublicActivities passando tutti i parametri estratti
    const activities = await fetchPublicActivities(pIva || '', query, filter, age, pathologies);
    // Restituisce l'oggetto con l'array delle attività come risposta JSON
    return NextResponse.json({ activities });
  } catch (error) {
    // Logga l'errore e restituisce errore 500
    console.error('Errore recupero materiali pubblici:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei materiali pubblici' },
      { status: 500 }
    );
  }
}
