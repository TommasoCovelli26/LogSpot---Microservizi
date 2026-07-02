// Importa la funzione notFound per mostrare la pagina 404
import { notFound } from 'next/navigation';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Esercizio from '@/models/Esercizio';
import Paziente from '@/models/Paziente';
// Importa le icone utilizzate nella pagina da Heroicons
import { 
  ArrowLeftIcon,      // Icona freccia indietro per la navigazione
  DocumentTextIcon,   // Icona documento per la sezione descrizione
  SparklesIcon,       // Icona stelline per il badge "Visualizzazione Assegnazione"
  CalendarIcon        // Icona calendario per la data di assegnazione
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
 * Corrisponde alla route '/logopedista/lista-pazienti/dettaglio-paziente/[cf]/esercizio/[id]'.
 */
export default async function AssignedExercisePage({ 
  params 
}: { 
  params: Promise<{ cf: string; id: string }>  // Parametri dinamici: CF del paziente e ID esercizio
}) {
  // Estrae il codice fiscale del paziente e l'ID dell'esercizio dai parametri
  const { cf, id } = await params;
  const exerciseId = id;

  // helper per compatibilità con gli id legacy
  function externalIdFromUnknown(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) return parsed;
      if (mongoose.isValidObjectId(value)) return Number.parseInt(value.slice(-8), 16);
    }
    if (value instanceof mongoose.Types.ObjectId) {
      return Number.parseInt(value.toString().slice(-8), 16);
    }
    return 0;
  }

  await connectToDatabase();

  // recupera paziente per poter filtrare anche sul riferimento ObjectId
  const patient = await Paziente.findOne({ cf }).select('_id cf').lean();
  const patientClauses: any[] = [{ id_paziente: cf }];
  if (patient?._id) patientClauses.push({ paziente: patient._id });

  // Costruisce clausole per cercare l'esercizio sia per legacy numeric id che per ObjectId
  const numericId = Number.parseInt(id, 10);
  const exerciseClauses: any[] = [];
  if (Number.isFinite(numericId)) exerciseClauses.push({ id: numericId });
  if (mongoose.isValidObjectId(id)) exerciseClauses.push({ _id: new mongoose.Types.ObjectId(id) });

  let exercise = null as any;
  if (exerciseClauses.length > 0) {
    exercise = await Esercizio.findOne({ $and: [{ $or: exerciseClauses }, { $or: patientClauses }] })
      .populate({ path: 'attivita', select: 'titolo descrizione istruzioni immagini immagine fasciaEta patologie' })
      .populate({ path: 'paziente', select: 'cf' })
      .lean();
  }

  // fallback: cerca tra tutti gli esercizi del paziente matching external numeric id
  if (!exercise && Number.isFinite(numericId)) {
    const candidates = await Esercizio.find({ $or: patientClauses })
      .populate({ path: 'attivita', select: 'titolo descrizione istruzioni immagini immagine fasciaEta patologie' })
      .populate({ path: 'paziente', select: 'cf' })
      .lean<any[]>();

    exercise = candidates.find((c) => externalIdFromUnknown(c.id ?? c._id) === numericId) || null;
  }

  if (!exercise) notFound();

  const activity = exercise.attivita || {};
  const patologieList = Array.isArray(activity.patologie)
    ? activity.patologie
    : (typeof activity.patologie === 'string' && activity.patologie.length > 0)
    ? activity.patologie.split(',').map((s: string) => s.trim())
    : [];

  const allegatiList = Array.isArray(activity.immagini)
    ? activity.immagini
    : (activity.immagine ? String(activity.immagine).split('|') : []);

  // Feedbacks: schema attuale memorizza un singolo feedback embedded per esercizio
  const feedbacks = exercise.feedback && (exercise.feedback.messaggio || '').trim()
    ? [
        {
          cod: externalIdFromUnknown(exercise.feedback._id),
          messaggio: exercise.feedback.messaggio,
          data: exercise.feedback.data ? new Date(exercise.feedback.data).toISOString() : new Date().toISOString(),
        },
      ]
    : [];

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER: navigazione breadcrumb e titolo dell'esercizio */}
      <div className="max-w-5xl mx-auto mb-8">
        {/* Link per tornare alla pagina dettaglio del paziente */}
        <Link 
          href={`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna al Paziente
        </Link>

        {/* Barra del titolo con badge e data di assegnazione */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
            {/* Titolo dell'esercizio con font Lusitana */}
            <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-yellow-400`}>
              {activity.titolo}
            </h1>
            
            {/* Badge informativi: tipo e data di assegnazione */}
            <div className="flex gap-3">
               {/* Badge: indica che si sta visualizzando un'assegnazione */}
               <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border bg-yellow-100 text-black border-yellow-500 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  Visualizzazione Assegnazione
               </span>
               {/* Badge: mostra la data di assegnazione dell'esercizio */}
               <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {exercise.dataAssegnazione ? new Date(exercise.dataAssegnazione).toLocaleDateString() : ''}
               </span>
            </div>
        </div>
      </div>

      {/* Layout a griglia: colonna contenuto (2/3) + colonna laterale info (1/3) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA: descrizione e obiettivo terapeutico */}
        <div className="lg:col-span-2 space-y-8">
            {/* Card descrizione con barra decorativa gialla laterale */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
                {/* Barra decorativa verticale gialla */}
                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                {/* Titolo sezione: Descrizione Attività */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" /> Descrizione Attività
                </h3>
                {/* Testo della descrizione dell'attività con supporto newline */}
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                  {activity.descrizione || "Nessuna descrizione."}
                </p>
                {/* Viewer per le immagini allegate all'attività */}
                <DetailImageViewer images={allegatiList} />
            </div>

            {/* Card obiettivo terapeutico con sfondo giallo chiaro */}
            <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-100">
                {/* Titolo sezione: Obiettivo Terapeutico */}
                <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-4">
                    Obiettivo Terapeutico
                </h3>
                {/* Testo dell'obiettivo in stile corsivo e dimensione grande */}
                <p className="text-yellow-900 font-medium text-xl italic leading-relaxed">
                  "{activity.istruzioni || 'Nessun obiettivo.'}"
                </p>
            </div>
        </div>

        {/* COLONNA DESTRA: stato, patologie e azioni */}
        <div className="space-y-6">
            
            {/* Card Stato di completamento dell'esercizio */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stato Attuale</h3>
                {/* Colore dinamico: verde se completato, giallo altrimenti */}
                 <p className={`text-xl font-bold uppercase ${exercise.statoCompletamento === 'completato' ? 'text-green-600' : 'text-yellow-400'}`}>
                   {exercise.statoCompletamento || 'Da Svolgere'}
                 </p>
            </div>

            {/* Card Patologie associate all'attività */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Patologie</h3>
                {/* Lista di badge per ogni patologia */}
                <div className="flex flex-wrap gap-2">
                    {patologieList.map((pat: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs font-bold uppercase border border-gray-200">
                            {pat}
                        </span>
                    ))}
                </div>
            </div>

            {/* Pulsante per rimuovere l'assegnazione dell'esercizio al paziente */}
            <div className="pt-6 border-t border-gray-100">
               <UnassignButton exerciseId={externalIdFromUnknown(exercise.id ?? exercise._id)} patientCf={cf} />
            </div>

        </div>
      </div>

      {/* SEZIONE FEEDBACK: mostra i feedback inviati dal paziente per questo esercizio */}
      <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
        {/* Titolo della sezione feedback */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback del Paziente</h2>
        
        {/* Se ci sono feedback, li mostra in una lista; altrimenti messaggio vuoto */}
        {feedbacks && feedbacks.length > 0 ? (
          <div className="space-y-4">
            {/* Itera su ogni feedback e renderizza una card */}
            {feedbacks.map((feedback: any) => (
              <div key={feedback.cod} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                {/* Header del feedback: etichetta e data */}
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                    Feedback 
                  </p>
                  {/* Data del feedback formattata in italiano */}
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
                {/* Messaggio del feedback con supporto newline */}
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                  {feedback.messaggio || 'Nessun messaggio'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Messaggio quando non ci sono feedback disponibili
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-500 text-lg">Nessun feedback disponibile per questo esercizio.</p>
          </div>
        )}
      </div>
    </main>
  );
}