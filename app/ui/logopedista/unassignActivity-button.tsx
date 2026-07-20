// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'icona cestino da Heroicons
import { TrashIcon } from '@heroicons/react/24/outline';
// Importazione della Server Action per rimuovere un esercizio assegnato
import { removeAssignedExercise } from '@/lib/actions';
// Importazione dell'hook useRouter per la navigazione programmatica
import { useRouter } from 'next/navigation';

/**
 * Componente pulsante per rimuovere un'attività assegnata a un paziente.
 * Mostra un dialog di conferma e poi invoca la Server Action.
 * @param exerciseId - ID dell'esercizio assegnato da rimuovere
 * @param patientCf - Codice fiscale del paziente
 */
export default function UnassignButton({ exerciseId, patientCf }: { exerciseId: string, patientCf: string }) {
  // Hook per la navigazione programmatica
  const router = useRouter();

  /**
   * Gestisce la rimozione dell'attività assegnata.
   * Chiede conferma, invoca la Server Action e reindirizza.
   */
  const handleRemove = async () => {
    // Mostra dialog di conferma nativo del browser
    const confirm = window.confirm("Sei sicuro di voler rimuovere questa attività dal piano del paziente?");
    // Se l'utente annulla, interrompe
    if (!confirm) return;

    // Invoca la Server Action per rimuovere l'assegnazione dal database
    const res = await removeAssignedExercise(exerciseId, patientCf);
    if (res.success) {
      // Se riuscito, mostra messaggio di successo
      alert("Attività rimossa correttamente.");
      // Reindirizza alla pagina di dettaglio del paziente
      router.push(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
    } else {
      // Se fallito, mostra l'errore
      alert("Errore: " + res.message);
    }
  };

  return (
    // Pulsante di rimozione con stile rosso e bordo, icona cestino
    <button 
      onClick={handleRemove}
      className="w-full mt-12 flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
    >
      {/* Icona cestino */}
      <TrashIcon className="w-5 h-5" />
      Rimuovi Attività
    </button>
  );
}