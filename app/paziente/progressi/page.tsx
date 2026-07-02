// Direttiva Next.js: indica che questo è un componente client-side
"use client";

// Importa gli hook React: useEffect per side-effects, useState per lo stato locale
import { useEffect, useState } from 'react';
// Importa l'hook useRouter per la navigazione programmatica
import { useRouter } from 'next/navigation';
// Importa il font personalizzato Lusitana
import { lusitana } from '@/ui/fonts';
// Importa la funzione utilità per formattare date in formato locale italiano
import { formatDateToLocal } from '@/lib/utils';

/**
 * Pagina "I Miei Traguardi" del paziente.
 * Componente Client che mostra le statistiche di completamento
 * degli esercizi e lo storico delle attività completate.
 * Corrisponde alla route '/paziente/progressi'.
 */
export default function ProgressiPazientePage() {
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Stato per memorizzare la lista degli esercizi del paziente
  const [exercises, setExercises] = useState<any[]>([]);
  // Stato per tracciare il caricamento dei dati
  const [isLoading, setIsLoading] = useState(true);

  // Effect: recupera la sessione e carica i progressi del paziente
  useEffect(() => {
    // Recupera i dati dell'utente dalla sessione in localStorage
    const sessione = localStorage.getItem("utente");
    // Se la sessione non esiste, reindirizza al login
    if (!sessione) {
      router.push("/login");
      return;
    }

    // Parsing dei dati utente e recupero del codice fiscale
    const utenteObj = JSON.parse(sessione);
    const cf = utenteObj.codice;
    
    /**
     * Funzione asincrona per caricare i progressi del paziente.
     * Chiama l'API /api/progressi con il CF del paziente.
     */
    const fetchProgressi = async () => {
      try {
        // Chiamata all'API progressi con il codice fiscale
        const res = await fetch(`/api/progressi?cf=${cf}`);
        if (res.ok) {
          const data = await res.json();
          // Aggiorna lo stato con gli esercizi ricevuti
          setExercises(data);
        }
      } catch (err) {
        console.error("Errore nel caricamento dei progressi", err);
      } finally {
        // Imposta caricamento completato
        setIsLoading(false);
      }
    };

    // Avvia il caricamento dei progressi
    fetchProgressi();
  }, [router]); // Si riesegue solo se il router cambia

  // === CALCOLO STATISTICHE ===
  // Numero totale di esercizi
  const total = exercises.length;
  // Filtra solo gli esercizi completati
  const completed = exercises.filter(ex => ex.statoCompletamento === 'completato');
  // Calcola la durata media delle sessioni completate (in minuti)
  const avgDuration = completed.length > 0 
    ? (completed.reduce((acc, curr) => acc + (curr.durata || 0), 0) / completed.length).toFixed(1) 
    : 0;

  // Mostra un messaggio di caricamento durante il fetch
  if (isLoading) return <div className="p-10 text-3xl">Analisi progressi in corso...</div>;

  return (
    // Container principale centrato con larghezza massima e padding
    <main className="w-full max-w-5xl mx-auto p-6">
      {/* Titolo della pagina con font Lusitana */}
      <h1 className={`${lusitana.className} text-5xl text-blue-900 mb-10`}>I Miei Traguardi</h1>

      {/* Sezione statistiche: due card grandi con numeri in evidenza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
        {/* Card: numero di esercizi completati su totale */}
        <div className="bg-blue-50 p-10 rounded-3xl border-2 border-blue-200 shadow-sm text-center">
          <p className="text-2xl text-blue-700 font-bold uppercase tracking-wider">Esercizi Fatti</p>
          {/* Numero grande: completati / totale */}
          <p className="text-6xl font-black text-blue-900 mt-4 text-">
            {completed.length} <span className="text-3xl text-blue-400">/ {total}</span>
          </p>
        </div>

        {/* Card: tempo medio per sessione in minuti */}
        <div className="bg-orange-50 p-10 rounded-3xl border-2 border-orange-200 shadow-sm text-center">
          <p className="text-2xl text-orange-700 font-bold uppercase tracking-wider">Tempo Medio</p>
          {/* Numero grande: durata media con unità di misura */}
          <p className="text-6xl font-black text-orange-900 mt-4">
            {avgDuration} <span className="text-3xl text-orange-400">min</span>
          </p>
        </div>
      </div>

      {/* Sezione storico: lista delle attività completate */}
      <h2 className={`${lusitana.className} text-4xl mb-8 text-gray-800 border-b-4 border-gray-100 pb-2`}>
        Storico Attività Completate
      </h2>
      
      {/* Lista delle card degli esercizi completati */}
      <div className="space-y-6">
        {completed.length > 0 ? (
          // Itera su ogni esercizio completato e mostra una card
          completed.map((ex) => (
            <div key={ex.id} className="p-8 bg-white rounded-2xl border-2 border-gray-100 shadow-md flex justify-between items-center">
              <div>
                {/* Titolo dell'esercizio */}
                <p className="text-3xl font-bold text-gray-900">{ex.titolo}</p>
                {/* Data di assegnazione formattata */}
                <p className="text-xl text-gray-500 mt-2">
                  Assegnata il: <span className="font-semibold">{formatDateToLocal(ex.dataAssegnazione)}</span>
                </p>
              </div>
              <div className="text-right">
                {/* Durata della sessione in minuti */}
                <p className="text-lg text-gray-400 mt-2">Durata sessione: {ex.durata} min</p>
              </div>
            </div>
          ))
        ) : (
          // Messaggio quando non ci sono esercizi completati
          <p className="text-2xl text-gray-400 italic">Non hai ancora completato nessun esercizio. Forza!</p>
        )}
      </div>
    </main>
  );
}