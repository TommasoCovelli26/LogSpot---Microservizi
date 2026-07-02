// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'icona lente di ricerca
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// Importazione degli hook di Next.js per parametri URL e navigazione
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// Importazione dell'hook useDebouncedCallback per ritardare le chiamate
import { useDebouncedCallback } from 'use-debounce';

/**
 * Componente barra di ricerca generico per la lista pazienti.
 * Utilizza debounce (300ms) e resetta la paginazione alla pagina 1 ad ogni ricerca.
 * @param placeholder - Testo placeholder da mostrare nell'input
 */
export default function Search({ placeholder }: { placeholder: string }) {
  // Ottiene i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Ottiene il pathname corrente
  const pathname = usePathname();
  // Destruttura la funzione replace dal router
  const { replace } = useRouter();

  /**
   * Gestisce la ricerca con debounce di 300ms.
   * Resetta la paginazione alla pagina 1 e aggiorna il parametro 'query'.
   * @param term - Termine di ricerca digitato dall'utente
   */
const handleSearch = useDebouncedCallback((term) => {    console.log(`Searching... ${term}`);
    // Crea una copia dei parametri URL correnti
    const params = new URLSearchParams(searchParams);
    // Resetta alla prima pagina ad ogni nuova ricerca
    params.set('page', '1');
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
    // Container flessibile con posizionamento relativo
    <div className="relative flex flex-1 flex-shrink-0">
      {/* Label accessibile nascosta visivamente per screen reader */}
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      {/* Input di ricerca con icona e stile peer per CSS condizionale */}
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          // Invoca la ricerca con debounce ad ogni cambiamento
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      {/* Icona lente posizionata a sinistra, cambia colore con focus via peer */}
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
