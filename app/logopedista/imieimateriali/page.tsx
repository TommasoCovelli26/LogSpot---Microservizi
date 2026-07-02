// Importa il componente Suspense da React per gestire il caricamento asincrono dei componenti
import { Suspense } from 'react';
// Importa la funzione cookies da Next.js per accedere ai cookie HTTP lato server
import { cookies } from 'next/headers';
// Importa la funzione redirect da Next.js per reindirizzamenti server-side
import { redirect } from 'next/navigation';
// Importa il componente pulsante per creare un nuovo materiale/attività
import CreateMaterialButton from '../../ui/logopedista/create-material';
// Importa il componente tabs per filtrare i materiali (recenti, preferiti, ecc.)
import MaterialsTabs from '../../ui/logopedista/materials-tabs';
// Importa il componente barra di ricerca per cercare tra i materiali
import MaterialsSearch from '../../ui/logopedista/materials-search';
// Importa il componente lista che renderizza le card dei materiali
import MaterialsList from '../../ui/logopedista/materials-list';
// Importa la funzione fetchActivities per recuperare le attività dal database
import { fetchActivities } from '../../lib/activities';

/**
 * Pagina "I miei materiali" del logopedista.
 * Componente Server (async) che recupera le attività del logopedista dal database
 * e le mostra in una lista con supporto per ricerca e filtri.
 * L'autenticazione viene verificata tramite cookie HTTP-only.
 * Corrisponde alla route '/logopedista/imieimateriali'.
 */
export default async function Page({
  searchParams,
}: {
  // I searchParams sono una Promise in Next.js 15+ (App Router)
  searchParams: Promise<{
    query?: string;   // Termine di ricerca (opzionale)
    filter?: string;  // Tipo di filtro: 'recenti', 'preferiti', ecc. (opzionale)
  }>;
}) {
  // Await dei parametri di ricerca dalla query string
  const params = await searchParams;
  // Estrae il termine di ricerca (default: stringa vuota)
  const query = params?.query || '';
  // Estrae il filtro selezionato (default: 'recenti')
  const filter = params?.filter || 'recenti';

  // 1. RECUPERO UTENTE DAI COOKIE
  // Accede allo store dei cookie HTTP lato server
  const cookieStore = await cookies();
  // Legge il cookie 'utente' che contiene i dati della sessione
  const userCookie = cookieStore.get('utente');

  // Se il cookie non esiste, l'utente non è autenticato: redirect al login
  if (!userCookie) {
    redirect('/login');
  }

  // Variabile per memorizzare l'ID dell'utente (P.IVA del logopedista)
  let userId = '';

  try {
    // Parsing del valore JSON del cookie
    const userData = JSON.parse(userCookie.value);
    
    // Verifica di autorizzazione: l'utente deve essere un logopedista con P.IVA
    if (userData.ruolo !== 'logopedista' || !userData.utente?.pIva) {
      // Se non è un logopedista autorizzato, reindirizza alla dashboard generica
      redirect('/dashboard'); 
    }

    // Salva la P.IVA reale dell'utente loggato
    userId = userData.utente.pIva;

  } catch (error) {
    // Se il cookie è malformato o non parsabile, reindirizza al login
    redirect('/login');
  }

  // 2. RECUPERO DATI DAL DB USANDO L'ID REALE
  // Chiama la funzione fetchActivities con la P.IVA del logopedista, il termine di ricerca e il filtro
  const activities = await fetchActivities(userId, query, filter);

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      {/* Container centrato con larghezza massima responsiva */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        {/* Pulsante per creare un nuovo materiale/attività */}
        <CreateMaterialButton />
        {/* Tabs per filtrare i materiali (recenti, preferiti, ecc.) */}
        <MaterialsTabs />
        {/* Barra di ricerca per cercare tra i materiali */}
        <MaterialsSearch />
        
        {/* Suspense boundary: mostra un fallback di caricamento mentre la lista viene renderizzata */}
        {/* La key cambia quando query o filter cambiano, forzando il re-render del Suspense */}
        <Suspense key={query + filter} fallback={<div className="text-center py-10 text-gray-500">Caricamento materiali...</div>}>
          {/* Lista dei materiali: riceve le attività recuperate dal database */}
          <MaterialsList activities={activities} />
        </Suspense>

      </div>
    </main>
  );
}