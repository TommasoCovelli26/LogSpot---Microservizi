// Importa le icone Heroicons: matita, più, cestino
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa la Server Action per eliminare un paziente
import { deletePatient } from '@/app/lib/actions';

/**
 * Componente pulsante per creare un nuovo paziente.
 * Renderizza un link stilizzato che porta alla pagina di creazione.
 */
export function CreatePatient() {
  return (
    // Link alla pagina di creazione paziente con stile pulsante blu
    <Link
      href="/dashboard/logopedista/pazienti/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
    >
      {/* Testo visibile solo su desktop, icona plus sempre visibile */}
      <span className="hidden md:block">Aggiungi Paziente</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

/**
 * Componente pulsante per modificare un paziente esistente.
 * Renderizza un link con icona matita che porta alla pagina di modifica.
 * @param id - Identificatore univoco del paziente
 */
export function UpdatePatient({ id }: { id: string }) {
  return (
    // Link alla pagina di modifica del paziente specifico
    <Link
      href={`/dashboard/logopedista/pazienti/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      {/* Icona matita per indicare la modifica */}
      < PencilIcon className="w-5" />
    </Link>
  );
}

/**
 * Componente pulsante per eliminare un paziente.
 * Utilizza una Server Action con l'id pre-collegato tramite bind.
 * @param id - Identificatore univoco del paziente da eliminare
 */
export function DeletePatient({ id }: { id: string }) {
  // Collega l'id del paziente alla Server Action tramite bind
  const deletePatientWithId = deletePatient.bind(null, id);
  return (
    // Form con action server-side per l'eliminazione
    <form action={deletePatientWithId}>
      {/* Pulsante submit con icona cestino */}
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        {/* Testo accessibile solo per screen reader */}
        <span className="sr-only">Elimina</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}