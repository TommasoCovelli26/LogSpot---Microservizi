// Direttiva Next.js: indica che questo è un componente client-side
"use client";

// Importa gli hook React: useEffect per side-effects, useState per lo stato locale
import { useEffect, useState } from "react";
// Importa l'hook useRouter per la navigazione programmatica
import { useRouter } from "next/navigation";
// Importa il componente Link per la navigazione client-side
import Link from "next/link";
// Importa i componenti della dashboard logopedista
import StatsOverview from "@/ui/logopedista/stats-overview";        // Panoramica statistiche
import PatientsToFollow from "@/ui/logopedista/patients-to-follow";  // Pazienti da seguire
import RecentExercises from "@/ui/logopedista/recent-exercises";     // Esercizi recenti
// Importa i componenti della dashboard paziente
import DashboardStats from "@/ui/paziente/dashboard-stats";          // Statistiche paziente
import CompletionProgress from "@/ui/paziente/completion-progress";    // Barra progresso
import NextExerciseCard from "@/ui/paziente/next-exercise-card";       // Card prossimo esercizio

/**
 * Pagina Dashboard principale.
 * Componente Client che mostra una dashboard diversa in base al ruolo dell'utente:
 * - Logopedista: statistiche, pazienti da seguire, esercizi recenti, card di navigazione
 * - Paziente: statistiche personali, progresso completamento, prossimo esercizio, card di navigazione
 * Corrisponde alla route '/dashboard'.
 */
export default function DashboardPage() {
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Stato per memorizzare i dati dell'utente loggato
  const [utente, setUtente] = useState<any>(null);
  // Stato per memorizzare gli esercizi del paziente
  const [exercises, setExercises] = useState<any[]>([]);
  // Stato per tracciare il caricamento degli esercizi del paziente
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  // Stato per le statistiche del logopedista (numero pazienti, assegnati, completati oggi, in corso)
  const [logopedistaStats, setLogopedistaStats] = useState({
    patients: 0,       // Numero totale di pazienti
    assigned: 0,       // Numero totale di esercizi assegnati
    completedToday: 0, // Esercizi completati oggi
    inProgress: 0,     // Esercizi in corso
  });
  // Stato per la lista dei pazienti con esercizi pending (da completare)
  const [patientsToFollow, setPatientsToFollow] = useState<
    { cf: string; nome: string; cognome: string; pending: number }[]
  >([]);
  // Stato per gli esercizi più recenti assegnati dal logopedista
  const [latestExercises, setLatestExercises] = useState<
    {
      id: number;
      titolo?: string;
      dataAssegnazione?: string;
      statoCompletamento?: string | null;
      patientName: string;
      patientCf: string;
    }[]
  >([]);
  // Stato per tracciare il caricamento delle statistiche del logopedista
  const [isLoadingLogopedistaStats, setIsLoadingLogopedistaStats] =
    useState(false);

  // Effect: recupera i dati dell'utente dal localStorage al montaggio
  useEffect(() => {
    // Legge la sessione utente dal localStorage
    const u = localStorage.getItem("utente");
    // Se la sessione non esiste, reindirizza al login
    if (!u) {
      router.push("/login");
      return;
    }
    // Parsing e salvataggio dei dati utente nello stato
    setUtente(JSON.parse(u));
  }, []);

  // Effect: carica gli esercizi se l'utente è un paziente
  useEffect(() => {
    // Si esegue solo se l'utente è loggato e ha il ruolo "paziente"
    if (!utente || utente.ruolo !== "paziente") return;

    /**
     * Funzione asincrona per caricare gli esercizi del paziente.
     * Chiama l'API /api/progressi con il CF del paziente.
     */
    const loadExercises = async () => {
      setIsLoadingExercises(true);
      try {
        // Fetch degli esercizi dal server tramite il codice fiscale
        const res = await fetch(`/api/progressi?cf=${utente.codice}`);
        if (res.ok) {
          const data = await res.json();
          // Aggiorna lo stato con gli esercizi ricevuti
          setExercises(data);
        }
      } catch (error) {
        console.error("Errore nel caricamento degli esercizi", error);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    // Avvia il caricamento degli esercizi
    loadExercises();
  }, [utente]);

  // Effect: carica le statistiche se l'utente è un logopedista
  useEffect(() => {
    // Si esegue solo se l'utente è loggato e ha il ruolo "logopedista"
    if (!utente || utente.ruolo !== "logopedista") return;

    /**
     * Funzione asincrona per caricare tutte le statistiche del logopedista.
     * Recupera la lista pazienti, poi per ciascuno recupera gli esercizi assegnati,
     * e infine calcola le statistiche aggregate.
     */
    const loadLogopedistaStats = async () => {
      setIsLoadingLogopedistaStats(true);
      try {
        // 1. Recupera la lista dei pazienti del logopedista
        const patientsRes = await fetch(
          `/api/lista-pazienti?pIva=${utente.codice}`
        );
        if (!patientsRes.ok) return;

        // Parsing della risposta: lista pazienti
        const patients = await patientsRes.json();
        // Assicura che sia un array
        const patientList = Array.isArray(patients) ? patients : [];
        // 2. Per ogni paziente, recupera in parallelo i suoi esercizi assegnati
        const exercisesResponses = await Promise.all(
          patientList.map((patient) =>
            fetch(`/api/esercizi?cf=${patient.cf}&pIva=${utente.codice}`)
          )
        );

        // 3. Parsing in parallelo di tutte le risposte degli esercizi
        const exercisesPayloads = await Promise.all(
          exercisesResponses.map((res) => (res.ok ? res.json() : []))
        );
        // 4. Calcola per ogni paziente il numero di esercizi non completati (pending)
        // e filtra solo quelli con almeno un esercizio pending
        const patientsWithPending = patientList
          .map((patient, index) => {
            const patientExercises = Array.isArray(exercisesPayloads[index])
              ? exercisesPayloads[index]
              : [];
            // Conta gli esercizi non ancora completati
            const pending = patientExercises.filter(
              (exercise) => exercise.statoCompletamento !== "completato"
            ).length;
            return { ...patient, pending };
          })
          .filter((patient) => patient.pending > 0); // Solo pazienti con esercizi da fare
        // 5. Costruisce una lista piatta di esercizi con le info del paziente associato
        const exercisesWithPatient = patientList.flatMap((patient, index) => {
          const patientExercises = Array.isArray(exercisesPayloads[index])
            ? exercisesPayloads[index]
            : [];
          // Associa a ogni esercizio il nome e CF del paziente
          return patientExercises.map((exercise) => ({
            id: exercise.id,
            titolo: exercise.titolo,
            dataAssegnazione: exercise.dataAssegnazione,
            statoCompletamento: exercise.statoCompletamento,
            patientName: `${patient.nome} ${patient.cognome}`,
            patientCf: patient.cf,
          }));
        });
        // 6. Calcola le statistiche aggregate per la dashboard
        // Appiattisce tutti gli esercizi di tutti i pazienti in un unico array
        const allExercises = exercisesPayloads.flat();
        // Conta gli esercizi completati oggi
        const completedToday = allExercises.filter(
          (exercise) =>
            exercise.statoCompletamento === "completato" &&
            isSameDay(exercise.dataAssegnazione)
        ).length;
        // Conta gli esercizi in corso (senza stato o con stato "in-corso")
        const inProgress = allExercises.filter(
          (exercise) =>
            !exercise.statoCompletamento ||
            exercise.statoCompletamento === "in-corso"
        ).length;

        // 7. Aggiorna tutti gli stati con i dati calcolati
        setLogopedistaStats({
          patients: patientList.length,     // Totale pazienti
          assigned: allExercises.length,    // Totale esercizi assegnati
          completedToday,                   // Completati oggi
          inProgress,                       // In corso
        });
        // Aggiorna la lista pazienti con esercizi pending
        setPatientsToFollow(patientsWithPending);
        // Aggiorna la lista esercizi con info paziente
        setLatestExercises(exercisesWithPatient);
      } catch (error) {
        console.error("Errore nel caricamento dei dati logopedista", error);
      } finally {
        // Segna il caricamento come completato
        setIsLoadingLogopedistaStats(false);
      }
    };

    // Avvia il caricamento delle statistiche
    loadLogopedistaStats();
  }, [utente]); // Si riesegue quando cambiano i dati dell'utente

  // Se l'utente non è ancora caricato, non renderizza nulla
  if (!utente) return null;

  // === CALCOLI STATISTICHE PAZIENTE ===
  // Numero totale di esercizi assegnati al paziente
  const totalExercises = exercises.length;
  // Numero di esercizi completati
  const completedExercises = exercises.filter(
    (ex) => ex.statoCompletamento === "completato"
  ).length;
  // Numero di esercizi in corso (senza stato o "in-corso")
  const inProgressExercises = exercises.filter(
    (ex) => !ex.statoCompletamento || ex.statoCompletamento === "in-corso"
  ).length;
  // Trova il prossimo esercizio da svolgere (il primo non completato)
  const nextExercise = exercises.find(
    (ex) => !ex.statoCompletamento || ex.statoCompletamento === "in-corso"
  );
  // Calcola la percentuale di completamento degli esercizi
  const completionRate = totalExercises
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;
  // Messaggio motivazionale basato sulla percentuale di completamento
  let motivationalMessage = "";

  if (completionRate === 0) {
    // Nessun esercizio completato
    motivationalMessage =
      "Si parte da qui: ogni esercizio conta. Inizia con calma e costanza.";
  } else if (completionRate < 100) {
    // Alcuni esercizi completati
    motivationalMessage =
      "Ottimo lavoro, continua cosi: stai avanzando nel tuo percorso.";
  } else {
    // Tutti gli esercizi completati
    motivationalMessage =
      "Complimenti, hai completato tutti gli esercizi!";
  }

  return (
    // Container principale della dashboard con padding e larghezza massima
    <div className="p-6 max-w-6xl mx-auto">
      {/* INTRODUZIONE: saluto e descrizione del ruolo */}
      <h1 className="text-3xl font-bold mb-2">
        Benvenuto 👋
      </h1>

      {/* Messaggio descrittivo diverso in base al ruolo dell'utente */}
      <p className="text-gray-600 mb-8">
        {utente.ruolo === "logopedista"
          ? "Da qui puoi gestire i tuoi pazienti, creare attività e monitorare i progressi."
          : "Da qui puoi svolgere i tuoi esercizi e seguire il tuo percorso riabilitativo."}
      </p>

      {/* === DASHBOARD LOGOPEDISTA === */}
      {/* Visualizzata solo se l'utente ha il ruolo "logopedista" */}
      {utente.ruolo === "logopedista" && (
        <div>
          {/* Panoramica statistiche: pazienti, assegnati, completati oggi, in corso */}
          <StatsOverview
            patients={logopedistaStats.patients}
            assigned={logopedistaStats.assigned}
            completedToday={logopedistaStats.completedToday}
            inProgress={logopedistaStats.inProgress}
            isLoading={isLoadingLogopedistaStats}
          />
          {/* Griglia di 3 card di navigazione rapida */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card: accesso alla lista pazienti */}
            <Card
              title="Pazienti"
              description="Consulta e gestisci in modo ordinato l'elenco dei tuoi pazienti."
              summary="Accedi alle schede cliniche, aggiorna le informazioni e verifica lo stato delle assegnazioni in corso."
              href="/logopedista/lista-pazienti"
            />
            {/* Card: accesso ai propri materiali/attività */}
            <Card
              title="Le mie attività"
              description="Crea e organizza attività riabilitative con criteri coerenti."
              summary="Gestisci i materiali disponibili, aggiorna i contenuti e riutilizza le attività con migliori risultati."
              href="/logopedista/imieimateriali"
            />
            {/* Card: accesso alla ricerca materiali pubblici */}
            <Card
              title="Ricerca Attività"
              description="Esplora attività riabilitative della community in modo mirato."
              summary="Applica filtri per obiettivi e patologie, valuta le proposte e salva ciò che è più pertinente."
              href="/logopedista/ricerca-materiali"
            />
          </div>
          {/* Sezione: pazienti con esercizi da completare */}
          <div className="mt-8">
            <PatientsToFollow
              patients={patientsToFollow}
              isLoading={isLoadingLogopedistaStats}
            />
          </div>
          {/* Sezione: esercizi assegnati più recenti */}
          <div className="mt-6">
            <RecentExercises
              exercises={latestExercises}
              isLoading={isLoadingLogopedistaStats}
            />
          </div>
        </div>
      )}

      {/* === DASHBOARD PAZIENTE === */}
      {/* Visualizzata solo se l'utente ha il ruolo "paziente" */}
      {utente.ruolo === "paziente" && (
        <div>
          {/* Griglia di 3 card di navigazione rapida per il paziente */}
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {/* Card: accesso agli esercizi assegnati */}
            <Card
              title="I miei esercizi"
              description="Svolgi gli esercizi assegnati dal tuo logopedista."
              summary="Ritrova l'elenco aggiornato delle attività, verifica le priorità e riprendi da dove eri arrivato."
              href="/paziente/esercizi"
            />
            {/* Card: accesso alla pagina progressi */}
            <Card
              title="Progressi"
              description="Monitora i tuoi miglioramenti con una visione chiara."
              summary="Consulta i risultati recenti, osserva l'andamento del percorso e identifica i punti di forza."
              href="/paziente/progressi"
            />
            {/* Card: accesso al profilo personale */}
            <Card
              title="Profilo"
              description="Visualizza e modifica i tuoi dati personali in sicurezza."
              summary="Aggiorna i recapiti, verifica le preferenze e mantieni il tuo profilo sempre allineato."
              href="/profilo"
            />
          </div>
          {/* Statistiche del paziente: totale, completati, in corso */}
          <DashboardStats
            total={totalExercises}
            completed={completedExercises}
            inProgress={inProgressExercises}
            isLoading={isLoadingExercises}
          />
          {/* Barra di progresso con percentuale di completamento e messaggio motivazionale */}
          <CompletionProgress
            percentage={completionRate}
            isLoading={isLoadingExercises}
            message={motivationalMessage}
          />
          {/* Card del prossimo esercizio da svolgere */}
          <div className="mb-8">
            <NextExerciseCard exercise={nextExercise} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente Card riutilizzabile per la dashboard.
 * Mostra un titolo, una descrizione e un riepilogo con link di navigazione.
 * Utilizzato sia nella dashboard logopedista che in quella paziente.
 */
function Card({
  title,
  description,
  summary,
  href,
}: {
  title: string;        // Titolo della card
  description: string;  // Descrizione breve
  summary: string;      // Riepilogo dettagliato
  href: string;         // URL di destinazione del link
}) {
  return (
    // Link che avvolge l'intera card, con stile gradiente e hover effect
    <Link
      href={href}
      className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition"
    >
      {/* Titolo della card in colore blu */}
      <h3 className="text-xl font-semibold mb-2 text-blue-600">
        {title}
      </h3>
      {/* Descrizione breve */}
      <p className="text-gray-700 text-sm mb-3">{description}</p>
      {/* Riepilogo dettagliato in testo più piccolo */}
      <p className="text-gray-600 text-xs leading-relaxed">
        {summary}
      </p>
    </Link>
  );
}

/**
 * Funzione utilità per verificare se una data corrisponde al giorno corrente.
 * Utilizzata per calcolare gli esercizi completati "oggi".
 * @param value - Stringa della data da confrontare
 * @returns true se la data è lo stesso giorno di oggi
 */
function isSameDay(value?: string) {
  // Se il valore è assente, restituisce false
  if (!value) return false;
  // Converte la stringa in oggetto Date
  const date = new Date(value);
  // Verifica che la data sia valida
  if (Number.isNaN(date.getTime())) return false;
  // Ottiene la data corrente
  const now = new Date();
  // Confronta anno, mese e giorno
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}


