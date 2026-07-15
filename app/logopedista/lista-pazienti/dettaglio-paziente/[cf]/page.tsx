// Importa la funzione per recuperare un paziente tramite codice fiscale
import { fetchPatientsByCf } from '@/lib/patients';
// Importa il font personalizzato Lusitana
import { lusitana } from '@/ui/fonts';
// Importa la funzione utilità per formattare date in formato locale italiano
import { formatDateToLocal } from '@/lib/utils';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa la funzione notFound per mostrare la pagina 404
import { notFound } from 'next/navigation';
// Importa il pulsante per disassociare il paziente dal logopedista
import UnassignButton from '@/ui/logopedista/unassign-button';
// Importa la funzione per recuperare gli esercizi assegnati a un paziente
import { fetchAssignedExercises } from '@/lib/activities';
// Importa il componente per mostrare la lista esercizi del paziente
import PazienteEsercizi from '@/ui/logopedista/paziente-esercizi';
// Importa le icone utilizzate nella pagina da Heroicons
import { 
  ArrowLeftIcon,      // Icona freccia indietro
  UserCircleIcon,     // Icona profilo utente
  EnvelopeIcon,       // Icona email
  PhoneIcon,          // Icona telefono
  CalendarIcon,       // Icona calendario
  DocumentTextIcon    // Icona documento
} from '@heroicons/react/24/outline';

/**
 * Pagina di dettaglio di un singolo paziente.
 * Componente Server che mostra le informazioni anagrafiche del paziente,
 * la lista dei suoi esercizi assegnati e il pulsante per disassociarlo.
 * Corrisponde alla route '/logopedista/lista-pazienti/dettaglio-paziente/[cf]'.
 */
export default async function Page({ params }: { params: Promise<{ cf: string }> }) {
  // Estrae il codice fiscale dai parametri dinamici della route
  const { cf } = await params;
  // Recupera i dati del paziente dal database tramite codice fiscale
  const patient = await fetchPatientsByCf(cf);

  // Se il paziente non esiste, mostra la pagina 404
  if (!patient) {
    notFound();
  }

  // Recupera la lista degli esercizi assegnati a questo paziente
  let exercises: any[] = [];
  try {
    exercises = await fetchAssignedExercises(cf);
  } catch (error) {
    console.error('Errore recupero esercizi paziente:', error);
  }

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER: navigazione e informazioni principali del paziente */}
      <div className="max-w-5xl mx-auto mb-8">
        {/* Link per tornare alla lista pazienti */}
        <Link 
          href="/logopedista/lista-pazienti"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna alla lista pazienti
        </Link>

        {/* Sezione header con nome paziente, CF e pulsante disassocia */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          {/* Informazioni del paziente: icona, nome e cognome, CF */}
          <div className="flex items-center gap-4">
            {/* Icona utente decorativa */}
            <UserCircleIcon className="w-12 h-12 text-yellow-400" />
            <div>
              {/* Nome completo del paziente con font Lusitana */}
              <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-yellow-400`}>
                {patient.cognome} {patient.nome}
              </h1>
              {/* Codice fiscale del paziente in font monospace */}
              <p className="text-sm text-gray-500 font-mono mt-1">{patient.cf}</p>
            </div>
          </div>
          
          {/* Pulsante per disassociare il paziente dal logopedista */}
          <div className="flex items-center gap-3">
            <UnassignButton cf={cf} />
          </div>
        </div>
      </div>

      {/* Layout a griglia: colonna esercizi (2/3) + colonna info (1/3) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA - Lista esercizi assegnati al paziente */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card con bordi arrotondati e barra laterale gialla decorativa */}
          <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
            {/* Barra decorativa verticale gialla sul lato sinistro */}
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
            {/* Titolo sezione: Esercizi Assegnati */}
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" /> Esercizi Assegnati
            </h3>
            {/* Componente che renderizza la lista degli esercizi del paziente */}
            <PazienteEsercizi exercises={exercises} patientCf={cf} />
          </div>
        </div>

        {/* COLONNA DESTRA - Informazioni anagrafiche del paziente */}
        <div className="space-y-6">
          
          {/* Card Data di Nascita */}
          <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Data di Nascita
            </h3>
            {/* Mostra la data formattata o 'Non disponibile' */}
            <p className="text-lg font-semibold text-blue-900">
              {patient.dataNascita ? formatDateToLocal(patient.dataNascita) : 'Non disponibile'}
            </p>
          </div>

          {/* Card Email del paziente */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" />
              Email
            </h3>
            {/* Email con word-break per testi lunghi */}
            <p className="text-sm text-blue-900 break-words">
              {patient.email}
            </p>
          </div>

          {/* Card Telefono del paziente */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Telefono
            </h3>
            {/* Mostra il numero di telefono o 'Non disponibile' */}
            <p className="text-sm text-blue-900">
              {patient.numTelefono || 'Non disponibile'}
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
