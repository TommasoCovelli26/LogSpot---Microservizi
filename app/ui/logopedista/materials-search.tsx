// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'icona lente di ricerca
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// Importazione degli hook di Next.js per parametri URL e navigazione
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// Importazione dell'hook useDebouncedCallback per ritardare le chiamate
import { useDebouncedCallback } from 'use-debounce';

/**
 * Componente barra di ricerca per la pagina materiali.
 * Utilizza debounce (300ms) per evitare troppe navigazioni durante la digitazione.
 * Sincronizza la query di ricerca con i parametri URL.
 */
export default function MaterialsSearch() {
  // Ottiene i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Ottiene il pathname corrente
  const pathname = usePathname();
  // Destruttura la funzione replace dal router
  const { replace } = useRouter();

  /**
   * Gestisce la ricerca con debounce di 300ms.
   * Aggiorna il parametro URL 'query' con il termine di ricerca.
   * @param term - Termine di ricerca digitato dall'utente
   */
  const handleSearch = useDebouncedCallback((term: string) => {
    // Crea una copia dei parametri URL correnti
    const params = new URLSearchParams(searchParams);
    if (term) {
      // Se c'è un termine, imposta il parametro 'query'
      params.set('query', term);
    } else {
      // Se il campo è vuoto, rimuove il parametro
      params.delete('query');
    }
    // Naviga all'URL aggiornato senza aggiungere alla history
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    // Container con posizionamento relativo per l'icona
    <div className="w-full relative mb-6">
      {/* Icona lente posizionata a sinistra dell'input */}
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      {/* Input di ricerca con debounce e valore iniziale dall'URL */}
      <input
        type="text"
        placeholder="CERCA..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-gray-600 focus:outline-none focus:border-yellow-400 shadow-sm"
      />
    </div>
  );
}