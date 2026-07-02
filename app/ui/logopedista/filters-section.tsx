// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'hook useState per gestire lo stato locale
import { useState } from 'react';
// Importazione delle icone per le frecce su/giù e l'imbuto filtro
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon } from '@heroicons/react/24/outline';
// Importazione del componente filtro per fascia d'età
import FiltersAge from './filters-age';
// Importazione del componente filtro per patologia
import FiltersPathology from './filters-pathology';

/**
 * Componente sezione filtri avanzati espandibile.
 * Contiene i filtri per età e patologia in una sezione a scomparsa
 * con animazione di apertura/chiusura.
 */
export default function FiltersSection() {
  // Stato booleano che controlla se la sezione filtri è espansa
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    // Container principale della sezione filtri
    <div className="w-full mb-6">
      {/* Header espandibile: pulsante che alterna apertura/chiusura */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 border border-gray-200 transition-colors flex items-center justify-between group"
      >
        {/* Lato sinistro: icona imbuto + testo */}
        <div className="flex items-center gap-3">
          <FunnelIcon className="w-5 h-5 text-gray-500 group-hover:text-yellow-500 transition-colors" />
          <span className="text-lg font-bold text-gray-700 uppercase tracking-wider">
            Filtri avanzati
          </span>
        </div>
        {/* Lato destro: icona freccia su (aperto) o giù (chiuso) */}
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500 group-hover:text-yellow-500 transition-colors" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500 group-hover:text-yellow-500    transition-colors" />
        )}
      </button>

      {/* Contenuto espandibile con animazione di altezza e opacità */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Card bianca contenente i filtri */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          {/* Filtro per fascia d'età con slider */}
          <FiltersAge />
          {/* Filtro per patologia con toggle buttons */}
          <FiltersPathology />
        </div>
      </div>
    </div>
  );
}
