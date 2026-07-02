// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa le icone Heroicons: lucchetto per privata, globo per pubblica
import { LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

/**
 * Interfaccia Props per il componente CreateAccessibility.
 * @property isPublic - Se true, l'attività è pubblica; se false, è privata
 * @property onChange - Callback invocata quando l'utente cambia la visibilità
 */
interface Props {
  isPublic: boolean;
  onChange: (val: boolean) => void;
}

/**
 * Componente per selezionare la visibilità dell'attività (Privata/Pubblica).
 * Mostra due pulsanti toggle: uno per "Privata" e uno per "Pubblica".
 * Il pulsante selezionato ha uno stile evidenziato (scuro per privata, verde per pubblica).
 */
export default function CreateAccessibility({ isPublic, onChange }: Props) {
  return (
    // Container principale con padding superiore
    <div className="w-full pt-4">
      {/* Etichetta della sezione */}
      <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
        VISIBILITÀ ATTIVITÀ
      </label>
      
      {/* Container dei due pulsanti toggle affiancati */}
      <div className="flex gap-4">
        {/* Pulsante PRIVATA: imposta isPublic a false */}
        <button
          onClick={() => onChange(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all group ${
            !isPublic
              ? 'bg-gray-800 border-gray-800 text-white shadow-lg scale-[1.02]'
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          {/* Icona lucchetto: gialla quando selezionata */}
          <LockClosedIcon className={`w-6 h-6 ${!isPublic ? 'text-yellow-400' : 'group-hover:text-gray-600'}`} />
          <div className="text-left">
            {/* Testo del pulsante */}
            <span className="block font-bold text-sm uppercase tracking-wider">Privata</span>
            {/* Descrizione breve */}
            <span className="block text-[10px] font-medium opacity-70">Solo tu puoi vederla</span>
          </div>
        </button>

        {/* Pulsante PUBBLICA: imposta isPublic a true */}
        <button
          onClick={() => onChange(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all group ${
            isPublic
              ? 'bg-green-600 border-green-600 text-white shadow-lg scale-[1.02]'
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          {/* Icona globo: bianca quando selezionata */}
          <GlobeAltIcon className={`w-6 h-6 ${isPublic ? 'text-white' : 'group-hover:text-green-600'}`} />
          <div className="text-left">
            {/* Testo del pulsante */}
            <span className="block font-bold text-sm uppercase tracking-wider">Pubblica</span>
            {/* Descrizione breve */}
            <span className="block text-[10px] font-medium opacity-70">Visibile a tutti</span>
          </div>
        </button>
      </div>
    </div>
  );
}