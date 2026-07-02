// Importazione del componente Link per la navigazione interna
import Link from 'next/link';
// Importazione del font Lusitana per lo stile dei titoli
import { lusitana } from '../fonts';
// Importazione del tipo AssignedExercise per la tipizzazione degli esercizi
import { AssignedExercise } from '../../lib/activities';

/**
 * Formatta una stringa data nel formato italiano gg/mm/aaaa.
 * @param dateString - Stringa data in formato ISO
 * @returns Data formattata in locale italiana
 */
const formatDate = (dateString: string) => {
  // Crea un oggetto Date dalla stringa
  const date = new Date(dateString);
  // Restituisce la data formattata in italiano con giorno, mese e anno a 2/4 cifre
  return date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

/**
 * Restituisce un badge colorato in base allo stato di completamento dell'esercizio.
 * @param status - Stato dell'esercizio: 'in-corso', 'completato', null o altro
 * @returns Elemento span con stile e testo appropriati
 */
const getStatusBadge = (status: string | null) => {
  // Se lo stato è null o 'in-corso', mostra badge giallo "In Corso"
  if (!status || status === 'in-corso') {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">In Corso</span>;
  }
  // Se lo stato è 'completato', mostra badge verde "Completato"
  if (status === 'completato') {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completato</span>;
  }
  // Per qualsiasi altro stato, mostra badge grigio "Non iniziato"
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Non iniziato</span>;
};

/**
 * Componente tabella degli esercizi assegnati al paziente.
 * Mostra titolo, stato e data di assegnazione per ogni esercizio.
 * Ogni riga è un link alla pagina di dettaglio dell'esercizio.
 * @param exercises - Array degli esercizi assegnati
 */
export default function ExercisesList({ exercises }: { exercises: AssignedExercise[] }) {
  return (
    // Container della tabella con bordo arrotondato e ombra
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header della tabella con le colonne */}
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-100">
        {/* Colonna titolo esercizio */}
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">ESERCIZIO</span>
        {/* Colonna stato di completamento */}
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-center">STATO</span>
        {/* Colonna data di assegnazione */}
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-right">DATA ASSEGNAZIONE</span>
      </div>

      {/* Corpo della tabella con le righe degli esercizi */}
      <div className="divide-y divide-gray-100">
        {/* Se ci sono esercizi, renderizza le righe */}
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            // Ogni riga è un Link alla pagina dettaglio dell'esercizio
            <Link 
              key={exercise.id}
              href={`/paziente/esercizi/${exercise.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-blue-50 transition-colors group"
            >
              {/* Titolo dell'esercizio con font Lusitana */}
              <span className={`font-bold text-gray-800 ${lusitana.className} text-lg group-hover:text-black flex-1`}>
                {exercise.titolo}
              </span>

              {/* Badge dello stato di completamento centrato */}
              <div className="w-32 flex justify-center">
                {getStatusBadge(exercise.statoCompletamento)}
              </div>

              {/* Data di assegnazione formattata allineata a destra */}
              <span className="text-gray-400 text-sm font-medium w-32 text-right">
                {formatDate(exercise.dataAssegnazione)}
              </span>
            </Link>
          ))
        ) : (
          // Messaggio mostrato quando non ci sono esercizi assegnati
          <div className="p-6 text-center text-gray-400 italic">
            Nessun esercizio assegnato.
          </div>
        )}
      </div>
    </div>
  );
}
