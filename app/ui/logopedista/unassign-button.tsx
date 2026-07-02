// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione della Server Action per disaccoppiare un paziente
import { unassignPatient } from '@/lib/actions';
// Importazione dell'hook useRouter per la navigazione programmatica
import { useRouter } from 'next/navigation';

/**
 * Componente pulsante per disaccoppiare un paziente dal logopedista.
 * Mostra un dialog di conferma prima di eseguire l'operazione.
 * @param cf - Codice fiscale del paziente da disaccoppiare
 */
export default function UnassignButton({ cf }: { cf: string }) {
  // Hook per la navigazione programmatica
  const router = useRouter();

  /**
   * Gestisce il click per disaccoppiare il paziente.
   * Chiede conferma, invoca la Server Action e reindirizza.
   */
  const handleUnassign = async () => {
    // Mostra dialog di conferma nativo del browser
    if (confirm('Sei sicuro di voler disaccoppiare questo paziente?')) {
      // Invoca la Server Action per rimuovere l'associazione
      const result = await unassignPatient(cf);
      if (result.success) {
        // Se riuscito, reindirizza alla lista pazienti
        router.push('/logopedista/lista-pazienti');
      } else {
        // Se fallito, mostra l'errore
        alert(result.error);
      }
    }
  };

  return (
    // Pulsante rosso per disaccoppiare il paziente
    <button
      onClick={handleUnassign}
      className="rounded-md bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700"
    >
      Disaccoppia
    </button>
  );
}
