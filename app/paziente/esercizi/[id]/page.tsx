// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa gli hook React: useEffect per side-effects, useState per lo stato locale
import { useEffect, useState } from 'react';
// Importa gli hook Next.js per navigazione e parametri dinamici della route
import { useRouter, useParams } from 'next/navigation';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa le icone Heroicons utilizzate nella pagina
import { 
  ArrowLeftIcon,          // Freccia per tornare indietro
  DocumentTextIcon,       // Icona documento per la sezione descrizione
  CheckCircleIcon,        // Icona check per lo stato "completato"
  ClockIcon,              // Icona orologio per lo stato "in corso"
  PaperAirplaneIcon       // Icona aeroplano per l'invio del feedback
} from '@heroicons/react/24/outline';
// Importa il font personalizzato Lusitana
import { lusitana } from '../../../ui/fonts';
// Importa il componente per visualizzare le immagini allegate all'esercizio
import DetailImageViewer from '../../../ui/logopedista/detail-image-viewer';

/**
 * Interfaccia TypeScript che definisce la struttura dei dati di un esercizio.
 * Contiene tutti i campi restituiti dall'API /api/esercizi/:id.
 */
interface ExerciseDetail {
  id: number;                           // Identificatore univoco dell'esercizio
  titolo: string;                       // Titolo dell'esercizio
  descrizione: string;                  // Descrizione dettagliata
  istruzioni: string;                   // Obiettivo terapeutico / istruzioni
  immagine: string;                     // Immagini allegate (separate da '|')
  fasciaEta: number;                    // Fascia d'età target dell'esercizio
  patologie: string;                    // Patologie trattate (separate da ',')
  statoCompletamento: string | null;    // Stato: 'in-corso', 'completato' o null
  dataAssegnazione: string;             // Data in cui l'esercizio è stato assegnato
}

/**
 * Pagina di dettaglio di un singolo esercizio per il paziente.
 * Componente Client che mostra tutti i dettagli dell'esercizio,
 * permette di aggiornare lo stato (in corso/completato) e di inviare feedback.
 * Corrisponde alla route '/paziente/esercizi/[id]'.
 */
export default function ExerciseDetailPage() {
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Estrae l'id dell'esercizio dai parametri dinamici della route
  const { id } = useParams<{ id: string }>();

  // Stato per memorizzare i dettagli dell'esercizio
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  // Stato per tracciare il caricamento iniziale dei dati
  const [loading, setLoading] = useState(true);
  // Stato per tracciare l'aggiornamento dello stato in corso
  const [updating, setUpdating] = useState(false);
  // Stato per memorizzare la lista dei feedback dell'esercizio
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  // Stato per il testo del nuovo feedback in fase di scrittura
  const [newFeedback, setNewFeedback] = useState('');
  // Stato per tracciare l'invio del feedback in corso
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Effect: carica i dettagli dell'esercizio e i feedback al mount
  useEffect(() => {
    // Se l'id non è ancora disponibile, non procedere
    if (!id) return;

    /**
     * Funzione asincrona per caricare i dettagli dell'esercizio.
     * Chiama l'API GET /api/esercizi/:id.
     */
    const fetchExercise = async () => {
      try {
        // Chiamata GET all'API con l'id dell'esercizio
        const response = await fetch(`/api/esercizi/${id}`);
        
        // Se la risposta non è OK, lancia un errore
        if (!response.ok) {
          throw new Error('Esercizio non trovato');
        }
        
        // Parsing della risposta e salvataggio nello stato
        const data = await response.json();
        setExercise(data);
      } catch (error) {
        console.error('Errore:', error);
        // In caso di errore, reindirizza alla lista esercizi
        router.push('/paziente/esercizi');
      } finally {
        // Caricamento completato (sia successo che errore)
        setLoading(false);
      }
    };

    /**
     * Funzione asincrona per caricare i feedback dell'esercizio.
     * Chiama l'API GET /api/esercizi/:id/feedback.
     */
    const fetchFeedbacks = async () => {
      try {
        // Chiamata GET all'API feedback per questo esercizio
        const response = await fetch(`/api/esercizi/${id}/feedback`);
        if (response.ok) {
          const data = await response.json();
          // Aggiorna lo stato con i feedback ricevuti
          setFeedbacks(data);
        }
      } catch (error) {
        console.error('Errore nel caricamento feedback:', error);
      }
    };

    // Avvia il caricamento parallelo di esercizio e feedback
    fetchExercise();
    fetchFeedbacks();
  }, [id, router]); // Si riesegue quando cambiano id o router

  /**
   * Handler per aggiornare lo stato di completamento dell'esercizio.
   * Invia una PATCH all'API con il nuovo stato ('in-corso' o 'completato').
   * @param status - Il nuovo stato da impostare
   */
  const handleUpdateStatus = async (status: string) => {
  if (!exercise || !id) return;
  
  setUpdating(true);
  try {
    const payload: any = { statoCompletamento: status };
    // Se l'esercizio viene completato, imposta di default 10 minuti di durata
    if (status === 'completato') {
      payload.durata = 10;
    }

    const response = await fetch(`/api/esercizi/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

      // Se la risposta non è OK, lancia un errore
      if (!response.ok) {
        throw new Error("Errore nell'aggiornamento dello stato");
      }

      // Dopo l'aggiornamento, reindirizza alla lista esercizi
      router.push('/paziente/esercizi');
    } catch (error) {
      console.error('Errore:', error);
      alert("Errore nell'aggiornamento dello stato");
    } finally {
      // Disattiva l'indicatore di aggiornamento
      setUpdating(false);
    }
  };

  /**
   * Handler per l'invio di un nuovo feedback.
   * Invia una POST all'API /api/esercizi/:id/feedback con il messaggio.
   * Dopo l'invio, aggiunge il feedback alla lista locale e resetta il campo.
   */
  const handleSendFeedback = async (e: React.FormEvent) => {
    // Previene il comportamento default del form (refresh della pagina)
    e.preventDefault();
    // Se il messaggio è vuoto o l'id non è disponibile, non procedere
    if (!newFeedback.trim() || !id) return;

    // Attiva l'indicatore di invio in corso
    setSendingFeedback(true);
    try {
      // Chiamata POST all'API per inviare il feedback
      const response = await fetch(`/api/esercizi/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaggio: newFeedback }),
      });

      // Se la risposta non è OK, lancia un errore
      if (!response.ok) {
        throw new Error('Errore nell\'invio del feedback');
      }

      // Parsing del feedback salvato dalla risposta
      const savedFeedback = await response.json();
      // Aggiunge il nuovo feedback in cima alla lista esistente
      setFeedbacks([savedFeedback, ...feedbacks]);
      // Resetta il campo di input del feedback
      setNewFeedback('');
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nell\'invio del feedback');
    } finally {
      // Disattiva l'indicatore di invio
      setSendingFeedback(false);
    }
  };

  // Se i dati sono in caricamento, mostra un indicatore di caricamento
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Caricamento esercizio...</div>
      </div>
    );
  }

  // Se l'esercizio non è stato trovato, non renderizza nulla
  if (!exercise) {
    return null;
  }

  // Prepara la lista delle patologie separando per virgola
  const patologieList = exercise.patologie ? exercise.patologie.split(',') : [];
  // Prepara la lista degli allegati/immagini separando per pipe '|'
  const allegatiList = exercise.immagine ? exercise.immagine.split('|') : [];

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* === HEADER: link "torna indietro", titolo e badge stato === */}
      <div className="max-w-5xl mx-auto mb-8">
        {/* Link per tornare alla lista degli esercizi */}
        <Link 
          href="/paziente/esercizi"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna agli esercizi
        </Link>

        {/* Riga con titolo e badge stato di completamento */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          {/* Titolo dell'esercizio con font Lusitana */}
          <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-blue-500`}>
            {exercise.titolo}
          </h1>
          
          {/* Badge stato: verde per completato, giallo per in corso */}
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
              exercise.statoCompletamento === 'completato'
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {exercise.statoCompletamento === 'completato' ? 'Completato' : 'In Corso'}
            </span>
          </div>
        </div>
      </div>

      {/* === CONTENUTO PRINCIPALE: griglia a 3 colonne (2 sx + 1 dx) === */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* === COLONNA SINISTRA (2/3): descrizione, obiettivo, azioni === */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card descrizione con barra laterale blu decorativa */}
          <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
            {/* Barra decorativa blu a sinistra */}
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-400"></div>
            {/* Titolo sezione con icona documento */}
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" /> Descrizione
            </h3>
            
            {/* Testo descrittivo dell'esercizio */}
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {exercise.descrizione || "Nessuna descrizione disponibile per questo esercizio."}
            </p>

            {/* Visualizzatore immagini, mostrato solo se ci sono allegati */}
            {allegatiList.length > 0 && (
              <DetailImageViewer images={allegatiList} />
            )}
          </div>

          {/* Card obiettivo terapeutico con sfondo azzurro */}
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            {/* Titolo sezione obiettivo */}
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">
              Obiettivo Terapeutico
            </h3>
            {/* Testo dell'obiettivo in corsivo */}
            <p className="text-blue-900 font-medium text-xl italic leading-relaxed">
              "{exercise.istruzioni || 'Nessun obiettivo specificato.'}"
            </p>
          </div>

          {/* === PULSANTI AZIONI: visibili solo se l'esercizio non è completato === */}
          {exercise.statoCompletamento !== 'completato' && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Pulsante "Salva e Continua Dopo": imposta lo stato a 'in-corso' */}
              <button
                onClick={() => handleUpdateStatus('in-corso')}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold uppercase text-sm hover:bg-gray-200 transition shadow-md tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClockIcon className="w-5 h-5" />
                Salva e Continua Dopo
              </button>

              {/* Pulsante "Completa Esercizio": imposta lo stato a 'completato' */}
              <button
                onClick={() => handleUpdateStatus('completato')}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-2xl font-bold uppercase text-sm hover:bg-green-600 transition shadow-md tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Completa Esercizio
              </button>
            </div>
          )}

          {/* Banner di conferma: mostrato quando l'esercizio è già completato */}
          {exercise.statoCompletamento === 'COMPLETATO' && (
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-green-50 text-green-700 rounded-2xl font-bold uppercase text-sm border-2 border-green-200">
              <CheckCircleIcon className="w-6 h-6" />
              Esercizio Completato
            </div>
          )}
        </div>

        {/* === COLONNA DESTRA (1/3): info aggiuntive === */}
        <div className="space-y-6">
          {/* Card Target Età con barra di progresso */}
          <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-400 shadow-sm">
            {/* Titolo sezione */}
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">
              Target Età
            </h3>
            {/* Valore numerico grande dell'età target */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-blue-900 tracking-tight">
                {exercise.fasciaEta}
              </span>
              <span className="text-blue-700 font-bold uppercase text-sm">
                anni
              </span>
            </div>
            {/* Barra di progresso visuale proporzionale all'età */}
            <div className="w-full bg-white h-3 rounded-full overflow-hidden relative border border-blue-200">
              <div 
                className="h-full bg-blue-400 rounded-full relative" 
                style={{ width: `${Math.min((exercise.fasciaEta / 123) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Card Patologie Trattate: lista delle patologie come tag */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
            {/* Titolo sezione patologie */}
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-4">
              Patologie Trattate
            </h3>
            {/* Container flex-wrap per i tag delle patologie */}
            <div className="flex flex-wrap gap-2">
              {patologieList.length > 0 ? (
                // Itera ogni patologia e la mostra come tag/badge
                patologieList.map((pat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white text-blue-800 rounded-lg text-xs font-bold uppercase border border-blue-200 tracking-wide shadow-sm"
                  >
                    {pat.trim()}
                  </span>
                ))
              ) : (
                // Messaggio se nessuna patologia è specificata
                <span className="text-blue-600 text-sm italic">
                  Nessuna patologia specificata.
                </span>
              )}
            </div>
          </div>

          {/* Card Data di Assegnazione dell'esercizio */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              {/* Etichetta "Assegnato il" */}
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Assegnato il
              </p>
              {/* Data formattata in italiano (giorno, mese esteso, anno) */}
              <p className="text-sm font-bold text-gray-800">
                {new Date(exercise.dataAssegnazione).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === SEZIONE FEEDBACK: form per inviare nuovo feedback + lista esistenti === */}
      <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
        {/* Titolo sezione feedback */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">I Miei Feedback</h2>
        
        {/* Form per scrivere e inviare un nuovo feedback */}
        <form onSubmit={handleSendFeedback} className="mb-8">
          <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
            {/* Etichetta del campo textarea */}
            <label htmlFor="feedback" className="block text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">
              Scrivi un feedback per il logopedista
            </label>
            {/* Textarea per il messaggio di feedback */}
            <textarea
              id="feedback"
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="Condividi la tua esperienza, difficoltà o domande sull'esercizio..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-gray-800"
              rows={4}
              disabled={sendingFeedback}
            />
            {/* Pulsante di invio allineato a destra */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={sendingFeedback || !newFeedback.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold uppercase text-sm hover:bg-blue-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                {/* Testo dinamico: "Invio..." durante l'invio, "Invia Feedback" normalmente */}
                {sendingFeedback ? 'Invio...' : 'Invia Feedback'}
              </button>
            </div>
          </div>
        </form>

        {/* Lista dei feedback già inviati */}
        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {/* Itera ogni feedback e mostra una card con data e messaggio */}
            {feedbacks.map((feedback: any) => (
              <div key={feedback.cod} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  {/* Etichetta "Feedback" */}
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                    Feedback
                  </p>
                  {/* Data e ora del feedback formattata in italiano */}
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
                {/* Testo del messaggio di feedback */}
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                  {feedback.messaggio || 'Nessun messaggio'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Messaggio quando non ci sono feedback
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-500 text-lg">Nessun feedback ancora inviato per questo esercizio.</p>
          </div>
        )}
      </div>
    </main>
  );
}
