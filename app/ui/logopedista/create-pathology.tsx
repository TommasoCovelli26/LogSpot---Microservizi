// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa l'hook useState per lo stato locale
import { useState } from 'react';
// Importa l'icona lente di ingrandimento per la barra di ricerca
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * Lista predefinita delle patologie disponibili per la selezione.
 * Contiene le principali patologie trattate in logopedia.
 */
const PATOLOGIES_LIST = [
  "AFASIA", "DISARTRIA", "BALBUZIE", "APRASSIA", "ANOMIA", "DISFONIA", 
  "DISFAGIA", "RITARDO LINGUAGGIO"
];

/**
 * Interfaccia Props per il componente CreatePathology.
 * @property selected - Array delle patologie già selezionate
 * @property onToggle - Callback per aggiungere/rimuovere una patologia dalla selezione
 */
interface Props {
  selected: string[];
  onToggle: (pat: string) => void;
}

/**
 * Componente per selezionare le patologie trattate dall'attività.
 * Include una barra di ricerca per filtrare e pulsanti toggle per ogni patologia.
 * Le patologie selezionate sono evidenziate in giallo.
 */
export default function CreatePathology({ selected, onToggle }: Props) {
  // Stato per il testo di ricerca/filtro delle patologie
  const [search, setSearch] = useState('');

  // Filtra le patologie in base al testo di ricerca (case-insensitive)
  const filtered = PATOLOGIES_LIST.filter(p => 
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // Container principale con padding superiore
    <div className="w-full pt-4">
        {/* Etichetta della sezione */}
        <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">PATOLOGIA</label>
        
        {/* Barra di ricerca con icona lente */}
        <div className="relative mb-6">
            {/* Icona lente posizionata a sinistra dell'input */}
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            {/* Input di ricerca per filtrare le patologie */}
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
                const isSelected = selected.includes(pat);
                return (
                    // Pulsante toggle: giallo se selezionato, bianco se non selezionato
                    <button
                        key={pat}
                        onClick={() => onToggle(pat)}
                        className={`px-6 py-2 rounded-full text-xs font-bold border transition uppercase tracking-wide ${
                            isSelected 
                            ? 'bg-yellow-400 border-yellow-400 text-black shadow-md transform scale-105' 
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