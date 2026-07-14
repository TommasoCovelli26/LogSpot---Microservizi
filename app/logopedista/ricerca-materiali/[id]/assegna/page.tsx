// Importa la funzione notFound per mostrare la pagina 404
import { notFound } from 'next/navigation';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa l'icona freccia indietro da Heroicons
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
// Importa la funzione per recuperare un'attività dal database tramite ID
import { fetchActivityById } from '../../../../lib/activities';
// Importa il font personalizzato Lusitana
import { lusitana } from '../../../../ui/fonts';
// Importa il componente client per l'assegnazione dell'attività ai pazienti
import AssignToPatient from './AssignToPatient';
// Importa la funzione cookies per accedere ai cookie HTTP lato server
import { cookies } from 'next/headers';
import { fetchPatients } from '@/lib/patients';

/**
 * Pagina di assegnazione di un'attività pubblica a un paziente.
 * Componente Server che recupera l'attività, i pazienti del logopedista
 * e mostra il componente AssignToPatient per effettuare l'assegnazione.
 * Corrisponde alla route '/logopedista/ricerca-materiali/[id]/assegna'.
 */
export default async function AssignPage({
  params
}: {
  params: Promise<{ id: string }>  // Parametri dinamici dell'URL (id dell'attività)
}) {
  // Estrae l'id dell'attività dai parametri dinamici della route
  const { id } = await params;
  // Recupera i dettagli dell'attività dal database
  const activity = await fetchActivityById(id);

  // Se l'attività non esiste o non è pubblica, mostra la pagina 404
  if (!activity || !activity.accessibilita) notFound();

  // Recupera la P.IVA del logopedista dai cookie HTTP
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  // Variabile per memorizzare l'ID del logopedista
  let logopedistaId = '';
  // Se il cookie esiste, estrae la P.IVA dal JSON
  if (userCookie) {
     const userData = JSON.parse(userCookie.value);
     logopedistaId = userData.utente?.pIva || '';
  }

  // Recupera i pazienti tramite il layer MongoDB
  const patients = await fetchPatients(logopedistaId);

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto mb-8">
        {/* Link per tornare alla pagina di ricerca materiali */}
        <Link
          href="/logopedista/ricerca-materiali"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna alla ricerca
        </Link>

        {/* Titolo dell'attività con font Lusitana */}
        <h1 className={`${lusitana.className} text-3xl md:text-4xl font-bold text-yellow-400 mb-4`}>
          {activity.titolo}
        </h1>

        {/* Container del componente di assegnazione */}
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          {/* Componente client per assegnare l'attività ai pazienti del logopedista */}
          {/* Riceve l'ID dell'attività (come stringa) e la lista dei pazienti */}
          <AssignToPatient activityId={id} patients={patients} />
        </div>
      </div>
    </main>
  );
}