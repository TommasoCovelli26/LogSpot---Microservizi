// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione degli hook di Next.js per parametri URL e navigazione
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// Importazione della libreria per classi CSS condizionali
import clsx from 'clsx';

/**
 * Componente tab per filtrare i materiali (Recenti/Preferiti).
 * Sincronizza il filtro attivo con il parametro URL 'filter'.
 */
export default function MaterialsTabs() {
  // Ottiene i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Ottiene il pathname corrente
  const pathname = usePathname();
  // Destruttura la funzione replace dal router
  const { replace } = useRouter();

  // Legge il filtro corrente dall'URL (default: 'recenti')
  const currentFilter = searchParams.get('filter') || 'recenti';

  /**
   * Gestisce il cambio di tab aggiornando il parametro URL 'filter'.
   * @param filter - Il nuovo filtro selezionato ('recenti' o 'preferiti')
   */
  const handleTabChange = (filter: string) => {
    // Crea una copia dei parametri URL correnti
    const params = new URLSearchParams(searchParams);
    // Imposta il nuovo filtro
    params.set('filter', filter);
    // Naviga all'URL aggiornato
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    // Container dei tab con scroll orizzontale su mobile
    <div className="flex gap-2 mb-6 w-full overflow-x-auto pb-2 justify-center md:justify-start">
      {/* Tab "Recenti": mostra tutte le attività ordinate per data */}
      <button
        onClick={() => handleTabChange('recenti')}
        className={clsx(
          "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
          currentFilter === 'recenti' 
            ? "bg-yellow-400 text-black shadow-md" 
            : "bg-white text-gray-400 border border-gray-200"
        )}
      >
        RECENTI
      </button>
      {/* Tab "Preferiti": mostra solo le attività preferite */}
      <button
        onClick={() => handleTabChange('preferiti')}
        className={clsx(
          "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
          currentFilter === 'preferiti' 
            ? "bg-yellow-400 text-black shadow-md" 
            : "bg-white text-gray-400 border border-gray-200"
        )}
      >
        PREFERITI
      </button>
    </div>
  );
}