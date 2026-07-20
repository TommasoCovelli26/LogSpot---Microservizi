// Importa la funzione notFound per mostrare la pagina 404
import { notFound } from 'next/navigation';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';

// --- NUOVI IMPORT PER I MICROSERVIZI ---
import { apiGet } from '../../../../../../../lib/http/client';
import { SERVICES } from '../../../../../../../lib/config/services';

// Importa le icone utilizzate nella pagina da Heroicons
import { 
  ArrowLeftIcon,      
  DocumentTextIcon,   
  SparklesIcon,       
  CalendarIcon        
} from '@heroicons/react/24/outline';
// Importa il font personalizzato Lusitana
import { lusitana } from '@/ui/fonts';
// Importa il componente per visualizzare le immagini dell'attività
import DetailImageViewer from '@/ui/logopedista/detail-image-viewer';
// Importa il pulsante per rimuovere l'assegnazione dell'esercizio
import UnassignButton from '@/ui/logopedista/unassignActivity-button';

/**
 * Pagina di dettaglio di un esercizio assegnato a un paziente.
 * Componente Server che mostra la descrizione dell'attività, le immagini,
 * l'obiettivo terapeutico, lo stato, le patologie e i feedback ricevuti.
 */
export default async function AssignedExercisePage({ 
  params 
}: { 
  params: Promise<{ cf: string; id: string }>
}) {
  // Estrae il codice fiscale del paziente e l'ID dell'esercizio dai parametri
  const { cf, id } = await params;

  try {
    // 1. Recupero l'esercizio dal Therapy Service
    const exercise = await apiGet<any>(`${SERVICES.THERAPY}/esercizi/${id}`);
    
    if (!exercise) return notFound();

    // 2. Recupero i dettagli dell'attività dal Catalog Service
    const actId = exercise.attivita || exercise.attivitaId || exercise.id_attivita;
    const activity = await apiGet<any>(`${SERVICES.CATALOG}/${actId}`).catch(() => ({}));

    // 3. Recupero l'eventuale feedback dal Therapy Service
    const feedbackRes = await apiGet<any>(`${SERVICES.THERAPY}/esercizi/${id}/feedback`).catch(() => null);

    // Formattazione Patologie
    const patologieList = Array.isArray(activity.patologie)
      ? activity.patologie
      : (typeof activity.patologie === 'string' && activity.patologie.length > 0)
      ? activity.patologie.split(',').map((s: string) => s.trim())
      : [];

    // Formattazione Immagini
    const allegatiList = Array.isArray(activity.immagini)
      ? activity.immagini
      : (activity.immagine ? String(activity.immagine).split('|') : []);

    // Formattazione Feedback
    const feedbacks = Array.isArray(feedbackRes) 
      ? feedbackRes.map((f: any, index: number) => ({
          cod: f.id || f.cod || Date.now() + index,
          messaggio: f.messaggio || f.testo || '',
          data: f.data || new Date().toISOString(),
        }))
      : (feedbackRes && feedbackRes.messaggio ? [feedbackRes] : []);

    return (
      <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
        
        {/* HEADER */}
        <div className="max-w-5xl mx-auto mb-8">
          <Link 
            href={`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Torna al Paziente
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
              <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-yellow-400`}>
                {activity.titolo || 'Esercizio'}
              </h1>
              
              <div className="flex gap-3">
                 <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border bg-yellow-100 text-black border-yellow-500 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    Visualizzazione Assegnazione
                 </span>
                 <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {exercise.dataAssegnazione ? new Date(exercise.dataAssegnazione).toLocaleDateString() : 'N/D'}
                 </span>
              </div>
          </div>
        </div>

        {/* CONTENUTO PRINCIPALE */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" /> Descrizione Attività
                  </h3>
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {activity.descrizione || "Nessuna descrizione."}
                  </p>
                  <DetailImageViewer images={allegatiList} />
              </div>

              <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-100">
                  <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-4">
                      Obiettivo Terapeutico
                  </h3>
                  <p className="text-yellow-900 font-medium text-xl italic leading-relaxed">
                    "{activity.istruzioni || 'Nessun obiettivo specificato.'}"
                  </p>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stato Attuale</h3>
                   <p className={`text-xl font-bold uppercase ${exercise.statoCompletamento === 'completato' ? 'text-green-600' : 'text-yellow-400'}`}>
                     {exercise.statoCompletamento || 'Da Svolgere'}
                   </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Patologie</h3>
                  <div className="flex flex-wrap gap-2">
                      {patologieList.length > 0 ? patologieList.map((pat: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs font-bold uppercase border border-gray-200">
                              {pat}
                          </span>
                      )) : <span className="text-sm text-gray-500">Nessuna</span>}
                  </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                 <UnassignButton exerciseId={String(exercise.id || id)} patientCf={cf} />
              </div>

          </div>
        </div>

        {/* SEZIONE FEEDBACK */}
        <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback del Paziente</h2>
          
          {feedbacks && feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback: any) => (
                <div key={feedback.cod} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                      Feedback 
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(feedback.data).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                    {feedback.messaggio || 'Nessun messaggio'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">Nessun feedback disponibile per questo esercizio.</p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Errore nel recupero dei dati dell'esercizio:", error);
    return notFound();
  }
}