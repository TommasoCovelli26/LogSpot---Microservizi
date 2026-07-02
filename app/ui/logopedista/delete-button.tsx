// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'icona cestino da Heroicons
import { TrashIcon } from '@heroicons/react/24/outline';
// Importazione della Server Action per eliminare un'attività
import { deleteActivity } from '../../lib/actions';
// Importazione dell'hook useState per gestire lo stato locale
import { useState } from 'react';

/**
 * Componente pulsante per eliminare un'attività.
 * Mostra un dialog di conferma prima di procedere all'eliminazione.
 * @param id - Codice identificativo dell'attività da eliminare
 */
export default function DeleteActivityButton({ id }: { id: number }) {
  // Stato che indica se è in corso un'eliminazione
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Gestisce il click sul pulsante elimina.
   * Mostra un dialog di conferma e poi invoca la Server Action.
   */
  const handleDelete = async () => {
    // Mostra dialog di conferma nativo del browser
    const confirm = window.confirm("Sei sicuro di voler eliminare definitivamente questa attività?");
    // Se l'utente annulla, interrompe l'operazione
    if (!confirm) return;

    // Imposta lo stato di eliminazione in corso
    setIsDeleting(true);
    // Chiamiamo la server action per eliminare l'attività dal database
    await deleteActivity(id);
    // Non serve settare false perché la pagina cambierà dopo la redirect
  };

  return (
    // Pulsante di eliminazione con stile rosso e bordo
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full mt-12 flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
    >
      {/* Mostra testo di caricamento o icona + testo normale */}
      {isDeleting ? (
        // Testo mostrato durante l'eliminazione
        <span>Eliminazione in corso...</span>
      ) : (
        // Contenuto normale: icona cestino + testo
        <>
          <TrashIcon className="w-6 h-6" />
          Elimina Attività
        </>
      )}
    </button>
  );
}