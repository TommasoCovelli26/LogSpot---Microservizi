// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa gli hook React: useState per lo stato locale, useEffect per i side-effects
import { useState, useEffect } from 'react';
// Importa l'hook useRouter per la navigazione programmatica e il refresh della pagina
import { useRouter } from 'next/navigation';
// Importa la server action per assegnare un esercizio a un paziente
import { assignExerciseToPatient } from '@/lib/actions';

/**
 * Interfaccia TypeScript che definisce la struttura di un paziente.
 * Viene usata per tipizzare la lista pazienti ricevuta come prop.
 */
interface Patient {
  cf: string;       // Codice Fiscale del paziente
  nome: string;     // Nome del paziente
  cognome: string;  // Cognome del paziente
}

/**
 * Interfaccia TypeScript per le props del componente.
 * Definisce activityId (numero o stringa) e la lista pazienti obbligatoria.
 */
interface Props {
  activityId: number | string;  // Accetta sia numeri che stringhe per compatibilità
  patients: Patient[];           // Lista dei pazienti del logopedista (obbligatoria)
}

/**
 * Componente Client per assegnare un'attività/esercizio a un paziente.
 * Mostra una barra di ricerca per filtrare i pazienti, verifica le assegnazioni
 * già esistenti tramite API e permette di assegnare con un click.
 * Viene riutilizzato sia dalla sezione "I miei materiali" che da "Ricerca materiali".
 */
export default function AssignToPatient({ activityId, patients }: Props) {
  // Hook per la navigazione programmatica e il refresh della pagina
  const router = useRouter();
  // Stato per il termine di ricerca nella barra di filtro pazienti
  const [query, setQuery] = useState('');
  // Stato per la lista dei pazienti filtrati in base alla ricerca
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients || []);
  // Stato per tenere traccia dei pazienti già assegnati a questa attività
  const [assignedIds, setAssignedIds] = useState<Record<string, boolean>>({});
  // Stato per il messaggio di feedback (successo o errore)
  const [message, setMessage] = useState<string | null>(null);
  // Stato per indicare se un'assegnazione è in corso
  const [isAssigning, setIsAssigning] = useState(false);
  // Stato per indicare se il caricamento delle assegnazioni esistenti è in corso
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Effect: carica le assegnazioni già esistenti per questa attività
  // Verifica quali pazienti hanno già questo esercizio assegnato
  useEffect(() => {
    /**
     * Funzione asincrona che recupera i codici fiscali dei pazienti
     * a cui l'attività è già stata assegnata.
     */
    const loadAssignedPatients = async () => {
      try {
        // Recupera la sessione utente dal localStorage
        const sessione = localStorage.getItem("utente");
        if (!sessione) return;

        // Estrae la P.IVA del logopedista dalla sessione
        const utenteObj = JSON.parse(sessione);
        const pIva = utenteObj.codice;

        // Chiamata API per ottenere i CF dei pazienti già assegnati
        const response = await fetch(`/api/esercizi/assign/${activityId}?pIva=${encodeURIComponent(pIva)}`);
        if (response.ok) {
          const data = await response.json();
          // Costruisce un record/mappa con i CF già assegnati impostati a true
          const assigned: Record<string, boolean> = {};
          data.assignedCFs.forEach((cf: string) => {
            assigned[cf] = true;
          });
          // Aggiorna lo stato con le assegnazioni esistenti
          setAssignedIds(assigned);
        }
      } catch (error) {
        console.error('Errore nel caricamento delle assegnazioni:', error);
      } finally {
        // Segna il caricamento delle assegnazioni come completato
        setIsLoadingAssignments(false);
      }
    };

    // Avvia il caricamento delle assegnazioni esistenti
    loadAssignedPatients();
  }, [activityId]); // Si riesegue solo se cambia l'ID dell'attività

  // Effect: filtra la lista pazienti in base al termine di ricerca
  useEffect(() => {
    // Se la lista pazienti non è disponibile, non fa nulla
    if (!patients) return;
    
    // Se il campo di ricerca è vuoto, mostra tutti i pazienti
    if (query.trim() === '') {
      setFilteredPatients(patients);
    } else {
      // Filtra i pazienti che contengono il termine di ricerca in nome, cognome o CF
      const lowerQ = query.toLowerCase();
      const filtered = patients.filter(p => 
        p.nome.toLowerCase().includes(lowerQ) || 
        p.cognome.toLowerCase().includes(lowerQ) ||
        p.cf.toLowerCase().includes(lowerQ)
      );
      setFilteredPatients(filtered);
    }
  }, [query, patients]); // Si riesegue quando cambia la query o la lista pazienti

  /**
   * Gestisce l'assegnazione dell'attività a un paziente specifico.
   * Chiama la server action assignExerciseToPatient e aggiorna lo stato locale.
   * @param cf - Codice Fiscale del paziente a cui assegnare l'attività
   */
  const handleAssign = async (cf: string) => {
    // Previene doppi click durante un'assegnazione in corso
    if (isAssigning) return;
    setIsAssigning(true);
    setMessage(null);
    
    // Chiama la server action per creare l'assegnazione nel database
    const result = await assignExerciseToPatient(cf, activityId);

    if (result.success) {
      // Assegnazione riuscita: mostra messaggio di successo
      setMessage('Attività assegnata con successo!');
      // Aggiorna lo stato locale per disabilitare il pulsante del paziente
      setAssignedIds((prev) => ({ ...prev, [cf]: true }));
      // Refresh della pagina per aggiornare i dati server-side
      router.refresh(); 
    } else {
      // Assegnazione fallita: mostra messaggio di errore
      setMessage(result.message || 'Errore durante l\'assegnazione.');
      // Se l'esercizio era già assegnato, aggiorna comunque lo stato
      if (result.message?.includes('già assegnato')) {
        setAssignedIds((prev) => ({ ...prev, [cf]: true }));
      }
    }
    // Segna l'assegnazione come completata
    setIsAssigning(false);
  };

  return (
    // Container principale del componente
    <div className="w-full">
      {/* Etichetta della sezione */}
      <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
        Assegna a paziente
      </label>

      {/* Barra di ricerca per filtrare i pazienti per nome, cognome o CF */}
      <div className="flex gap-2 mb-4">
        {/* Campo di input per la ricerca */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome o cognome"
          className="flex-1 pl-4 pr-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-yellow-400 transition"
        />
        {/* Pulsante "Cerca" decorativo (il filtraggio avviene in tempo reale) */}
        <button
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-500 transition"
        >
          Cerca
        </button>
      </div>

      {/* Lista scrollabile dei pazienti filtrati */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredPatients.length === 0 ? (
          // Messaggio quando nessun paziente corrisponde alla ricerca
          <div className="text-sm text-gray-400 italic">Nessun paziente trovato.</div>
        ) : (
          // Itera su ogni paziente filtrato e mostra una card
          filteredPatients.map((p) => (
            <div key={p.cf} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3 hover:border-yellow-200 transition shadow-sm">
              {/* Informazioni del paziente: nome completo e CF */}
              <div>
                <div className="font-bold text-gray-800">{p.nome} {p.cognome}</div>
                <div className="text-xs text-gray-500">{p.cf}</div>
              </div>
              {/* Pulsante di assegnazione con stati diversi */}
              <div>
                <button
                  onClick={() => handleAssign(p.cf)}
                  disabled={!!assignedIds[p.cf] || isAssigning || isLoadingAssignments}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide transition ${
                    assignedIds[p.cf] 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'  // Già assegnato: grigio disabilitato
                      : isLoadingAssignments
                      ? 'bg-gray-200 text-gray-400 cursor-wait'        // Caricamento: grigio con attesa
                      : 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm' // Disponibile: giallo attivo
                  }`}
                >
                  {/* Testo dinamico del pulsante in base allo stato */}
                  {isLoadingAssignments ? '...' : assignedIds[p.cf] ? 'Assegnato' : 'Assegna'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Messaggio di feedback: successo (verde) o errore (rosso) */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm text-center font-bold ${
          message.includes('successo') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}