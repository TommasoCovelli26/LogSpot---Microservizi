// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa gli hook React: useEffect per side-effects, useState per lo stato locale, use per unwrap Promise
import { useEffect, useState, use } from 'react';
// Importa l'hook useRouter per la navigazione programmatica
import { useRouter } from 'next/navigation';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa il font personalizzato Lusitana
import { lusitana } from '@/ui/fonts';
// Importa le icone utilizzate nella pagina da Heroicons
import { ArrowLeftIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

/**
 * Interfaccia TypeScript che definisce la struttura di un feedback.
 * Rappresenta i dati restituiti dall'API /api/feedback.
 */
interface Feedback {
  cod: number;                 // Codice univoco del feedback
  messaggio: string;           // Testo del messaggio di feedback
  data: string;                // Data e ora di invio del feedback
  id_paziente: string;         // Codice fiscale del paziente che ha inviato il feedback
  id_esercizio: number;        // ID dell'esercizio a cui si riferisce il feedback
  titolo_esercizio: string;    // Titolo dell'esercizio associato
  cognome_paziente: string;    // Cognome del paziente
  nome_paziente: string;       // Nome del paziente
}

/**
 * Pagina dei feedback ricevuti dal logopedista.
 * Componente Client che recupera e mostra tutti i feedback
 * inviati dai pazienti sugli esercizi assegnati.
 * Corrisponde alla route '/logopedista/lista-pazienti/feedback'.
 */
export default function FeedbackPage() {
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Stato per memorizzare la lista dei feedback ricevuti
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  // Stato per tracciare il caricamento dei dati
  const [isLoading, setIsLoading] = useState(true);
  // Stato per memorizzare eventuali errori durante il caricamento
  const [error, setError] = useState<string | null>(null);

  // Effect: gestione sessione e caricamento dei feedback
  useEffect(() => {
    // Recupera i dati dell'utente dalla sessione in localStorage
    const sessione = localStorage.getItem("utente");

    // Se la sessione non esiste, reindirizza al login
    if (!sessione) {
      router.push("/login");
      return;
    }

    // Parsing dei dati utente dalla sessione
    const utenteObj = JSON.parse(sessione);
    const logopedistaId = utenteObj.id;

    /**
     * Funzione asincrona per caricare i feedback dall'API.
     * Chiama /api/feedback passando l'ID del logopedista come parametro query.
     */
    const loadFeedbacks = async () => {
      setIsLoading(true);
      try {
        // Chiamata all'API dei feedback con l'ID del logopedista
        const response = await fetch(`/api/feedback?pIva=${encodeURIComponent(logopedistaId)}`);
        // Verifica che la risposta sia ok
        if (!response.ok) {
          throw new Error('Errore nel caricamento dei feedback');
        }
        // Parsing della risposta JSON
        const data = await response.json();
        // Aggiorna lo stato con i feedback ricevuti
        setFeedbacks(data);
      } catch (err) {
        console.error("Errore nel caricamento dei feedback:", err);
        // Imposta il messaggio di errore
        setError('Impossibile caricare i feedback');
      } finally {
        // Imposta caricamento completato in ogni caso
        setIsLoading(false);
      }
    };

    // Avvia il caricamento dei feedback
    loadFeedbacks();
  }, [router]); // Si riesegue solo se il router cambia

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      {/* Container centrato con larghezza massima responsiva */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        
        {/* Breadcrumb: link per tornare alla lista pazienti */}
        <div className="w-full mb-6">
          <Link 
            href="/logopedista/lista-pazienti"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium uppercase text-sm tracking-wider"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Torna alla lista pazienti
          </Link>
        </div>

        {/* Header: titolo pagina con icona e sottotitolo descrittivo */}
        <div className="w-full mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* Icona chat bubble decorativa */}
            <ChatBubbleLeftIcon className="w-8 h-8 text-yellow-400" />
            {/* Titolo della pagina con font Lusitana */}
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-yellow-400 font-bold`}>
              Feedback Pazienti
            </h1>
          </div>
          {/* Sottotitolo descrittivo */}
          <p className="text-gray-500 mt-2">
            Visualizza tutti i feedback ricevuti dai tuoi pazienti sugli esercizi assegnati.
          </p>
        </div>

        {/* Contenuto principale: gestione dei tre stati (caricamento, errore, dati) */}
        {isLoading ? (
          // Stato di caricamento: messaggio di attesa
          <div className="text-center py-10 text-gray-500">Caricamento in corso...</div>
        ) : error ? (
          // Stato di errore: messaggio di errore in rosso
          <div className="w-full bg-red-50 rounded-lg p-8 text-center border border-red-200">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : feedbacks.length > 0 ? (
          // Stato con dati: lista dei feedback ricevuti
          <div className="w-full space-y-4">
            {/* Itera su ogni feedback e renderizza una card */}
            {feedbacks.map((feedback) => (
              <div key={feedback.cod} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
                {/* Header della card: titolo esercizio, nome paziente e data */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    {/* Titolo dell'esercizio associato al feedback */}
                    <h3 className="text-lg font-bold text-gray-900">
                      {feedback.titolo_esercizio}
                    </h3>
                    {/* Nome del paziente che ha inviato il feedback */}
                    <p className="text-sm text-gray-600 mt-1">
                      Paziente: <span className="font-semibold">{feedback.cognome_paziente} {feedback.nome_paziente}</span>
                    </p>
                  </div>
                  {/* Data del feedback formattata in italiano */}
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(feedback.data).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Box del messaggio di feedback */}
                <div className="bg-gray-50 rounded p-4 border border-gray-100">
                  {/* Testo del feedback con supporto newline */}
                  <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                    {feedback.messaggio || '(Nessun messaggio)'}
                  </p>
                </div>

                {/* Footer: link per navigare al dettaglio dell'esercizio */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/logopedista/lista-pazienti/dettaglio-paziente/${feedback.id_paziente}/esercizio/${feedback.id_esercizio}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-500 transition"
                  >
                    Vai all'esercizio
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Stato vuoto: nessun feedback disponibile
          <div className="w-full bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
            {/* Icona decorativa */}
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Nessun feedback disponibile dai tuoi pazienti.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
