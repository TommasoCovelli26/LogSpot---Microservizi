// Direttiva Next.js: indica che questo è un componente client-side
"use client";

// Importa il componente Search per la barra di ricerca pazienti
import Search from '@/ui/logopedista/search';
// Importa il componente tabella per visualizzare i pazienti
import PatientsTable from '@/ui/logopedista/pazienti-table';
// Importa il font personalizzato Lusitana
import { lusitana } from '@/ui/fonts';
// Importa la funzione fetchPatients per recuperare la lista pazienti
import { fetchPatients } from '@/lib/patients';
// Importa gli hook React necessari: Suspense, useEffect, useState, use
import { Suspense, useEffect, useState, use } from 'react';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa l'hook useRouter per la navigazione programmatica
import { useRouter } from 'next/navigation';
// Importa le icone da Heroicons
import { ChatBubbleLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

/**
 * Pagina "Lista Pazienti" del logopedista.
 * Componente Client che mostra la lista dei pazienti del logopedista con ricerca,
 * link alla pagina feedback e al form di accoppiamento nuovo paziente.
 * La P.IVA viene recuperata da localStorage per filtrare i pazienti.
 * Corrisponde alla route '/logopedista/lista-pazienti'.
 */
export default function Page(props: {
  searchParams: Promise<{ query?: string }>;  // Parametri di ricerca dall'URL
}) {
  // Unwrap della Promise dei searchParams (necessario in Next.js 15+ con use())
  const searchParams = use(props.searchParams);
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Stato per memorizzare la lista dei pazienti recuperati
  const [patients, setPatients] = useState<any[]>([]);
  // Stato per tracciare il caricamento dei dati
  const [isLoading, setIsLoading] = useState(true);
  
  // Estrae il termine di ricerca dalla query string (default: stringa vuota)
  const query = searchParams?.query || '';

  // Effect: gestione sessione e caricamento dati pazienti
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
    // Recupero della P.IVA del logopedista dal localStorage
    const pIva = utenteObj.codice;

    /**
     * Funzione asincrona per caricare la lista dei pazienti.
     * Chiama fetchPatients con la P.IVA e il termine di ricerca.
     */
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch dei pazienti basato sulla P.IVA della sessione e il termine di ricerca
        const data = await fetchPatients(pIva, query);
        // Aggiorna lo stato con i dati dei pazienti
        setPatients(data);
      } catch (error) {
        console.error("Errore nel caricamento dei pazienti:", error);
      } finally {
        // Imposta caricamento completato in ogni caso
        setIsLoading(false);
      }
    };

    // Avvia il caricamento dei dati
    loadData();
  }, [query, router]); // Riesegue quando cambia il termine di ricerca o il router

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      {/* Container centrato con larghezza massima responsiva */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        
        {/* Header: titolo pagina e pulsanti azione */}
        <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {/* Titolo della pagina con font Lusitana */}
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-yellow-400 font-bold`}>
              Lista Pazienti
            </h1>
            {/* Sottotitolo descrittivo */}
            <p className="text-gray-500 mt-2">
              Gestisci i tuoi pazienti e visualizza i loro progressi.
            </p>
          </div>
          
          {/* Gruppo pulsanti: Feedback e Nuovo Paziente */}
          <div className="flex gap-3">
            {/* Pulsante per andare alla pagina feedback */}
            <Link 
              href="/logopedista/lista-pazienti/feedback" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full font-bold uppercase text-xs hover:bg-blue-600 transition shadow-md tracking-wider"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Feedback
            </Link>
            {/* Pulsante per andare alla pagina di accoppiamento nuovo paziente */}
            <Link 
              href="/logopedista/lista-pazienti/accoppiamento-paziente" 
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-bold uppercase text-xs hover:bg-green-600 transition shadow-md tracking-wider"
            >
              <PlusIcon className="w-4 h-4" />
              Nuovo Paziente
            </Link>
          </div>
        </div>

        {/* Barra di Ricerca per cercare pazienti per nome o cognome */}
        <div className="w-full mb-6">
          <Search placeholder="Cerca per nome o cognome..." />
        </div>
        
        {/* Lista Pazienti: mostra un indicatore di caricamento o la tabella */}
        {isLoading ? (
          // Indicatore di caricamento
          <div className="text-center py-10 text-gray-500">Caricamento in corso...</div>
        ) : (
          // Tabella dei pazienti
          <div className="w-full">
            <PatientsTable patients={patients} />
          </div>
        )}
      </div>
    </main>
  );
}