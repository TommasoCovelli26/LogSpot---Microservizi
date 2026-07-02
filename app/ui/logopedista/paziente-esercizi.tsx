// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione delle icone per stato completamento e visualizzazione
import { 
  CheckCircleIcon,  // Icona cerchio con spunta
  ClockIcon,        // Icona orologio
  EyeIcon           // Icona occhio per visualizzazione
} from '@heroicons/react/24/outline';
// Importazione del tipo AssignedExercise per la tipizzazione
import { AssignedExercise } from '@/lib/activities';
// Importazione della libreria per classi CSS condizionali
import clsx from 'clsx';
// Importazione del componente Link di Next.js per la navigazione
import Link from 'next/link';

/**
 * Componente che mostra la lista degli esercizi assegnati a un paziente.
 * Utilizzato nella pagina di dettaglio paziente del logopedista.
 * @param exercises - Array degli esercizi assegnati
 * @param patientCf - Codice fiscale del paziente per costruire i link
 */
export default function PazienteEsercizi({ 
  exercises, 
  patientCf 
}: { 
  exercises: AssignedExercise[], 
  patientCf: string 
}) {
  
  // Se non ci sono esercizi, mostra un messaggio placeholder
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return (
      // Card con messaggio di assenza esercizi
      <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
        <p className="text-gray-500 italic">Nessun esercizio assegnato a questo paziente.</p>
      </div>
    );
  }

  return (
    // Container verticale con gap tra le card degli esercizi
    <div className="flex flex-col gap-4">
      {/* Itera ogni esercizio e lo renderizza come card */}
      {exercises.map((exercise) => (
        <div 
          key={exercise.id} 
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-yellow-400"
        >
          {/* Sezione sinistra: titolo e data assegnazione */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* Link al dettaglio dell'esercizio assegnato con icona occhio */}
              <Link 
                href={`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}/esercizio/${exercise.id}`}
                className="font-bold text-gray-800 text-lg hover:text-yellow-400 hover:underline flex items-center gap-2 group"
                title="Vedi dettagli assegnazione"
              >
                {/* Titolo dell'esercizio */}
                {exercise.titolo}
                {/* Icona occhio che cambia colore al hover */}
                <EyeIcon className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
              </Link>
            </div>
            {/* Data di assegnazione formattata in italiano */}
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Assegnato il: {new Date(exercise.dataAssegnazione).toLocaleDateString('it-IT')}
            </p>
          </div>

          {/* Sezione destra: badge stato completamento */}
          <div className="flex items-center gap-4">
            {/* Badge colorato in base allo stato: verde per completato, giallo per in corso, grigio per da svolgere */}
            <div className={clsx(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1",
              {
                'bg-green-100 text-green-700': exercise.statoCompletamento === 'completato',
                'bg-yellow-100 text-yellow-800': exercise.statoCompletamento === 'in-corso' || !exercise.statoCompletamento,
                'bg-gray-100 text-gray-600': exercise.statoCompletamento === 'da-svolgere',
              }
            )}>
              {/* Icona e testo in base allo stato */}
              {exercise.statoCompletamento === 'completato' ? (
                // Stato completato: icona spunta verde + testo
                <>
                  <CheckCircleIcon className="w-4 h-4" /> Completato
                </>
              ) : (
                // Stato in corso/da svolgere: icona orologio + testo
                <>
                  <ClockIcon className="w-4 h-4" /> In Corso
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}