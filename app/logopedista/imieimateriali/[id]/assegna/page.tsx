// Importa la funzione cookies per accedere ai cookie HTTP lato server
import { cookies } from 'next/headers';
import { fetchActivityById } from '@/lib/activities';
import { fetchPatients } from '@/lib/patients';
// Importa la funzione notFound per mostrare la pagina 404
import { notFound } from 'next/navigation';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa l'icona freccia indietro da Heroicons
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
// Importa il font personalizzato Lusitana
import { lusitana } from '@/ui/fonts';
// Importa il componente AssignToPatient (riutilizzato dalla sezione ricerca materiali)
import AssignToPatient from '../../../ricerca-materiali/[id]/assegna/AssignToPatient';

/**
 * Pagina di assegnazione di un materiale proprio a un paziente.
 * Recupera l'attività, la lista dei pazienti del logopedista e mostra
 * il componente AssignToPatient per effettuare l'assegnazione.
 * Corrisponde alla route '/logopedista/imieimateriali/[id]/assegna'.
 */
export default async function AssignMyMaterialPage({ 
  params 
}: { 
  params: Promise<{ id: string }>  // Parametri dinamici dell'URL (id dell'attività)
}) {
  // Estrae l'id dell'attività dai parametri dinamici della route
  const { id } = await params;
  // Manteniamo l'id come stringa per la risoluzione tramite MongoDB
  const activityId = id;

  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  let logopedistaPiva = '';
  let logopedistaRealId = '';
  if (userCookie) {
    const userData = JSON.parse(userCookie.value);
    logopedistaPiva = userData.utente?.pIva || userData.utente?.PIva || userData.utente?.codice || '';
    logopedistaRealId = userData.utente?.id || userData.utente?._id || logopedistaPiva;
  }

  // Recupera i pazienti usando la P.IVA (così vengono trovati quelli associati)
  const patients = await fetchPatients(logopedistaPiva);

  // Recupera il dettaglio dell'attività tramite MongoDB
  const activity = await fetchActivityById(id);

  // Se l'attività non esiste, mostra la pagina 404
  if (!activity) notFound();

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto mb-8">
        {/* Link per tornare al dettaglio dell'attività */}
        <Link
          href={`/logopedista/imieimateriali/${id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna al dettaglio
        </Link>

        {/* Titolo dell'attività con font Lusitana */}
        <h1 className={`${lusitana.className} text-3xl md:text-4xl font-bold text-yellow-400 mb-4`}>
          {activity.titolo}
        </h1>

        {/* Container del componente di assegnazione */}
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          {/* Componente riutilizzabile per assegnare l'attività ai pazienti */}
          {/* Riceve l'ID dell'attività e la lista dei pazienti del logopedista */}
          <AssignToPatient activityId={activityId} patients={patients} logopedistaId={logopedistaRealId} />
        </div>
      </div>
    </main>
  );
}