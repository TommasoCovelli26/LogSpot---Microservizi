// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa l'icona Plus per il pulsante di creazione
import { PlusIcon } from '@heroicons/react/24/outline';

/**
 * Componente pulsante per creare una nuova attività/materiale.
 * Mostra un'icona decorativa a forma di computer/schermo e un pulsante
 * giallo "NUOVA ATTIVITÀ" che porta alla pagina di creazione.
 */
export default function CreateMaterialButton() {
  return (
    // Container centrato verticalmente con margini
    <div className="w-full flex flex-col items-center mb-8 mt-4">
      {/* Icona decorativa: simulazione di un monitor/schermo */}
      <div className="relative mb-4">
        {/* Corpo dello schermo con icona Plus al centro */}
        <div className="w-32 h-24 border-4 border-yellow-400 rounded-xl flex items-center justify-center bg-gray-50 shadow-sm">
          <PlusIcon className="w-10 h-10 text-yellow-500" />
        </div>
        {/* Base/piedistallo dello schermo */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400 rounded-full"></div>
      </div>

      {/* Link alla pagina di creazione nuova attività */}
      <Link href="/logopedista/crea">
        {/* Pulsante giallo con icona Plus e testo */}
        <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 transition-colors text-black font-bold py-3 px-8 rounded-xl shadow-md text-lg">
          <PlusIcon className="w-6 h-6" />
          NUOVA ATTIVITÀ
        </button>
      </Link>
    </div>
  );
}