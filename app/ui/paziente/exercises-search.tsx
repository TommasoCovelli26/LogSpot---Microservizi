// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'icona lente di ingrandimento per la barra di ricerca
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// Importazione degli hook per gestire parametri URL, percorso corrente e navigazione
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// Importazione dell'hook per il debounce della callback di ricerca
import { useDebouncedCallback } from 'use-debounce';

/**
 * Componente barra di ricerca per filtrare gli esercizi del paziente.
 * Utilizza il debounce (300ms) per aggiornare il parametro 'query' nell'URL.
 */
export default function ExercisesSearch() {
  // Legge i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Ottiene il percorso corrente della pagina
  const pathname = usePathname();
  // Ottiene la funzione replace per aggiornare l'URL senza aggiungere una voce nella cronologia
  const { replace } = useRouter();

  // Callback debounced che aggiorna il parametro 'query' nell'URL dopo 300ms di inattività
  const handleSearch = useDebouncedCallback((term: string) => {
    // Crea una copia dei parametri URL correnti
    const params = new URLSearchParams(searchParams);
    // Se il termine non è vuoto, imposta il parametro 'query'
    if (term) {
      params.set('query', term);
    } else {
      // Se vuoto, rimuove il parametro 'query' dall'URL
      params.delete('query');
    }
    // Aggiorna l'URL con i nuovi parametri senza navigazione completa
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    // Container della barra di ricerca con posizionamento relativo
    <div className="relative w-full mb-6">
      {/* Etichetta accessibile visibile solo agli screen reader */}
      <label htmlFor="search" className="sr-only">
        Cerca
      </label>
      {/* Input di ricerca con bordo arrotondato e padding sinistro per l'icona */}
      <input
        className="peer block w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 text-sm outline-2 placeholder:text-gray-500"
        placeholder="Cerca esercizi..."
        onChange={(e) => handleSearch(e.target.value)} // Avvia la ricerca debounced ad ogni cambio
        defaultValue={searchParams.get('query')?.toString()} // Valore iniziale dal parametro URL
      />
      {/* Icona lente posizionata a sinistra dell'input, cambia colore al focus */}
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
