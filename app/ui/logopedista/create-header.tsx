// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa l'icona freccia sinistra per il pulsante "torna indietro"
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * Componente header per la pagina di creazione attività.
 * Mostra un pulsante "Annulla e Torna indietro" che chiama la callback onBack.
 * @param onBack - Funzione callback invocata al click sul pulsante
 */
export default function CreateHeader({ onBack }: { onBack: () => void }) {
  return (
    // Container flex allineato a sinistra con margine inferiore
    <div className="w-full flex items-center mb-2">
      {/* Pulsante per annullare e tornare alla pagina precedente */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition font-bold uppercase text-sm tracking-wider"
      >
        {/* Icona freccia sinistra */}
        <ArrowLeftIcon className="w-5 h-5" />
        Annulla e Torna indietro
      </button>
    </div>
  );
}