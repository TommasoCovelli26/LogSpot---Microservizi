// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione del componente Link per la navigazione tra tab
import Link from 'next/link';
// Importazione dell'hook per leggere i parametri di ricerca dall'URL
import { useSearchParams } from 'next/navigation';

/**
 * Componente tab per filtrare gli esercizi del paziente per stato.
 * Mostra 3 tab: Tutti, In Corso, Completati.
 * Il tab attivo è evidenziato in blu, gli altri in grigio.
 */
export default function ExercisesTabs() {
  // Legge i parametri di ricerca dall'URL
  const searchParams = useSearchParams();
  // Determina il filtro corrente (default: 'tutti')
  const filter = searchParams.get('filter') || 'tutti';

  // Definizione dei tab disponibili con chiave e etichetta
  const tabs = [
    { key: 'tutti', label: 'Tutti' },       // Mostra tutti gli esercizi
    { key: 'in-corso', label: 'In Corso' },  // Mostra solo esercizi in corso
    { key: 'completati', label: 'Completati' }, // Mostra solo esercizi completati
  ];

  return (
    // Container flex dei tab con gap e margine inferiore
    <div className="flex gap-2 mb-6 w-full">
      {/* Mappa ogni tab in un Link con stile condizionale */}
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`?filter=${tab.key}`} // Imposta il filtro nell'URL
          className={`flex-1 py-2 text-center font-semibold rounded-lg transition ${
            filter === tab.key
              ? 'bg-blue-500 text-white'  // Stile tab attivo: sfondo blu, testo bianco
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200' // Stile tab inattivo: sfondo grigio
          }`}
        >
          {/* Etichetta del tab */}
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
