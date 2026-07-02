// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione degli hook di Next.js per parametri URL e navigazione
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// Importazione dell'hook useState per gestire lo stato locale
import { useState } from 'react';
// Importazione dell'icona lente di ricerca
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Lista costante delle patologie disponibili per il filtro
const PATOLOGIES_LIST = [
  "AFASIA", "DISARTRIA", "BALBUZIE", "APRASSIA", "ANOMIA", "DISFONIA",
  "DISFAGIA", "RITARDO LINGUAGGIO"
];

/**
 * Componente filtro per patologia nella pagina di ricerca materiali.
 * Mostra pulsanti toggle per ciascuna patologia con ricerca testuale.
 * Sincronizza la selezione con i parametri URL.
 */
export default function FiltersPathology() {
  // Ottiene i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Ottiene il pathname corrente
  const pathname = usePathname();
  // Destruttura la funzione replace dal router
  const { replace } = useRouter();
  // Stato per la stringa di ricerca locale nella lista patologie
  const [search, setSearch] = useState('');

  // Legge le patologie attualmente selezionate dall'URL (separate da virgola)
  const currentPathologies = searchParams.get('pathologies')?.split(',').filter(Boolean) || [];

  /**
   * Gestisce il toggle di una patologia (aggiunge o rimuove dalla selezione).
   * Aggiorna i parametri URL di conseguenza.
   * @param pat - Nome della patologia da aggiungere/rimuovere
   */
  const handleToggle = (pat: string) => {
    // Crea una copia dei parametri URL correnti
    const params = new URLSearchParams(searchParams);
    // Ottiene le patologie attualmente selezionate
    const current = params.get('pathologies')?.split(',').filter(Boolean) || [];
    
    // Determina il nuovo array: rimuove se già presente, aggiunge altrimenti
    let newPathologies: string[];
    if (current.includes(pat)) {
      // Rimuove la patologia dalla selezione
      newPathologies = current.filter(p => p !== pat);
    } else {
      // Aggiunge la patologia alla selezione
      newPathologies = [...current, pat];
    }

    // Aggiorna o rimuove il parametro URL in base alla selezione
    if (newPathologies.length > 0) {
      // Se ci sono patologie selezionate, imposta il parametro
      params.set('pathologies', newPathologies.join(','));
    } else {
      // Se non ci sono più patologie, rimuove il parametro
      params.delete('pathologies');
    }
    
    // Naviga all'URL aggiornato senza aggiungere alla history
    replace(`${pathname}?${params.toString()}`);
  };

  // Filtra la lista delle patologie in base alla ricerca testuale (case-insensitive)
  const filtered = PATOLOGIES_LIST.filter(p =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // Container del filtro patologie
    <div className="w-full pt-4 mb-6">
      {/* Etichetta del filtro */}
      <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
        PATOLOGIA
      </label>

      {/* Campo di ricerca con icona lente */}
      <div className="relative mb-6">
        {/* Icona lente posizionata a sinistra */}
        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        {/* Input di ricerca per filtrare le patologie mostrate */}
        <input
          type="text"
          placeholder="CERCA..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-yellow-400 outline-none transition text-sm font-medium placeholder-gray-400 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Griglia di pulsanti toggle per le patologie filtrate */}
      <div className="flex flex-wrap gap-3">
        {filtered.map((pat) => {
          // Verifica se la patologia corrente è già selezionata
          const isSelected = currentPathologies.includes(pat);
          return (
            // Pulsante toggle: giallo se selezionato, bianco altrimenti
            <button
              key={pat}
              onClick={() => handleToggle(pat)}
              className={`px-6 py-2 rounded-full text-xs font-bold border transition uppercase tracking-wide ${
                isSelected
                  ? 'bg-yellow-500 border-yellow-500 text-black shadow-md transform scale-105'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-black'
              }`}
            >
              {/* Nome della patologia */}
              {pat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
