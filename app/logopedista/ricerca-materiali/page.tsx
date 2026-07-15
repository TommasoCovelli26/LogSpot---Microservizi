// Direttiva Next.js: indica che questo è un componente client-side
"use client";

// Importa Suspense per il boundary richiesto quando si usa useSearchParams
import { Suspense } from 'react';
// Importa gli hook React: useEffect per side-effects, useMemo per memoizzazione, useState per lo stato
import { useEffect, useMemo, useState } from 'react';
// Importa il componente tabs per filtrare i materiali (Recenti / Preferiti)
import MaterialsTabs from '../../ui/logopedista/materials-tabs';
// Importa il componente barra di ricerca per i materiali
import MaterialsSearch from '../../ui/logopedista/materials-search';
// Importa il componente lista per visualizzare le card dei materiali
import MaterialsList from '../../ui/logopedista/materials-list';
// Importa il componente filtri espandibili (età, patologie)
import FiltersSection from '../../ui/logopedista/filters-section';
// Importa il font personalizzato Lusitana
import { lusitana } from '../../ui/fonts';
// Importa hook Next.js per navigazione e lettura dei parametri URL
import { useRouter, useSearchParams } from 'next/navigation';
// Importa il tipo TypeScript per le attività con stato preferito
import type { ActivityWithFavorite } from '../../lib/activities';

/**
 * Pagina di ricerca materiali pubblici.
 * Componente Client che mostra tutti i materiali con accessibilità pubblica,
 * con filtri per età, patologie, ricerca testuale e tabs (recenti/preferiti).
 * Corrisponde alla route '/logopedista/ricerca-materiali'.
 */
function PageContent() {
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Hook per leggere i parametri della query string nell'URL
  const searchParams = useSearchParams();

  // Stato per memorizzare la P.IVA del logopedista (recuperata da localStorage)
  const [pIva, setPIva] = useState<string | null>(null);
  // Stato per memorizzare la lista delle attività recuperate dall'API
  const [activities, setActivities] = useState<ActivityWithFavorite[]>([]);
  // Stato per tracciare il caricamento dei dati
  const [isLoading, setIsLoading] = useState(false);
  // Stato per memorizzare eventuali errori durante il caricamento
  const [error, setError] = useState<string | null>(null);

  // Estrae i parametri di filtro dalla query string dell'URL
  const query = searchParams.get('query') || '';           // Termine di ricerca testuale
  const filter = searchParams.get('filter') || 'recenti';  // Tab attiva (recenti/preferiti)
  const age = searchParams.get('age');                      // Filtro per fascia d'età
  const pathologies = searchParams.get('pathologies');      // Filtro per patologie

  // Costruisce l'URL dell'API in modo memoizzato
  // Si ricalcola solo quando cambiano i parametri di filtro
  const apiUrl = useMemo(() => {
    // Crea un oggetto URLSearchParams per costruire la query string
    const params = new URLSearchParams();
    // Aggiunge i parametri solo se hanno un valore
    if (pIva) params.set('pIva', pIva);                // P.IVA del logopedista
    if (query) params.set('query', query);             // Termine di ricerca
    if (filter) params.set('filter', filter);          // Tab attiva
    if (age) params.set('age', age);                   // Fascia d'età
    if (pathologies) params.set('pathologies', pathologies); // Patologie
    // Restituisce l'URL completo dell'API
    return `/api/materiali-pubblici?${params.toString()}`;
  }, [pIva, query, filter, age, pathologies]);

  // Effect: recupera la P.IVA dalla sessione utente in localStorage
  useEffect(() => {
    // Legge i dati della sessione dal localStorage
    const sessione = localStorage.getItem('utente');

    // Se la sessione non esiste, reindirizza al login
    if (!sessione) {
      router.push('/login');
      return;
    }

    try {
      // Parsing dei dati utente e estrazione della P.IVA
      // Parsing dei dati utente e estrazione dell'ID (priorità a MongoDB)
      const utenteObj = JSON.parse(sessione);
      setPIva(utenteObj.id ?? utenteObj._id ?? utenteObj.codice ?? utenteObj.pIva ?? utenteObj.PIva ?? null);
    } catch (e) {
      console.error('Errore parsing sessione:', e);
      // In caso di errore nel parsing, reindirizza al login
      router.push('/login');
    }
  }, [router]); // Si riesegue solo se il router cambia

  // Effect: recupera le attività dall'API quando cambiano i filtri o la P.IVA
  useEffect(() => {
    // Non esegue il fetch se la P.IVA non è ancora disponibile
    if (!pIva) return;

    /**
     * Funzione asincrona per caricare le attività dall'API dei materiali pubblici.
     * Utilizza l'URL costruito dal useMemo sopra.
     */
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Chiamata all'API senza cache per ottenere dati aggiornati
        const res = await fetch(apiUrl, { cache: 'no-store' });
        // Verifica che la risposta sia ok
        if (!res.ok) throw new Error('Errore nel caricamento');

        // Parsing della risposta JSON
        const data = await res.json();
        // Aggiorna lo stato con le attività ricevute (array vuoto come fallback)
        setActivities(data.activities || []);
      } catch (err) {
        console.error(err);
        // Imposta il messaggio di errore
        setError('Errore nel caricamento dei materiali.');
      } finally {
        // Imposta caricamento completato in ogni caso
        setIsLoading(false);
      }
    };

    // Avvia il caricamento delle attività
    fetchActivities();
  }, [pIva, apiUrl]); // Si riesegue quando cambiano P.IVA o URL dell'API

  /**
   * Callback per gestire il cambio di stato preferito di un'attività.
   * Aggiorna lo stato locale per riflettere immediatamente il cambio.
   * Se il filtro attivo è "preferiti" e si rimuove un preferito, rimuove la card dalla lista.
   * @param id - ID dell'attività
   * @param isFavorite - Nuovo stato preferito (true/false)
   */
  const handleFavoriteChange = (id: string, isFavorite: boolean) => {
    setActivities((prev) => {
      if (filter === 'preferiti' && !isFavorite) {
        return prev.filter((act) => act.id !== id);
      }
      // Altrimenti aggiorna lo stato preferito dell'attività nella lista
      return prev.map((act) => 
        act.id === id ? { ...act, isFavorite } : act
      );
    });
  };

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      {/* Container centrato con larghezza massima responsiva */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        {/* Header: titolo pagina e sottotitolo descrittivo */}
        <header className="w-full mb-6 text-center md:text-left">
          {/* Titolo della pagina con font Lusitana */}
          <h1 className={`${lusitana.className} text-3xl md:text-4xl text-yellow-400 font-bold`}>
            Ricerca materiali pubblici
          </h1>
          {/* Sottotitolo descrittivo */}
          <p className="text-gray-500 mt-2">
            Esplora tutte le attività con accessibilità pubblica.
          </p>
        </header>

        {/* Tabs per filtrare: Recenti / Preferiti */}
        <MaterialsTabs />

        {/* Barra di ricerca testuale per cercare materiali */}
        <MaterialsSearch />

        {/* Sezione filtri espandibili: età e patologie */}
        <FiltersSection />

        {/* Lista Materiali: gestione dei tre stati (caricamento, errore, dati) */}
        {isLoading ? (
          // Stato di caricamento
          <div className="text-center py-10 text-gray-500">Caricamento materiali...</div>
        ) : error ? (
          // Stato di errore
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          // Lista dei materiali con callback per gestione preferiti
          <MaterialsList
            activities={activities}
            baseHref="/logopedista/ricerca-materiali"
            onFavoriteChange={handleFavoriteChange}
          />
        )}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-500">Caricamento pagina...</div>}>
      <PageContent />
    </Suspense>
  );
}