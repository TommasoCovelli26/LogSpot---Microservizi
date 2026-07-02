// Importazione del componente Link di Next.js per la navigazione
import Link from "next/link";

/**
 * Tipo delle props del componente RecentExercises.
 * @property exercises - Array di esercizi recenti con dettagli e paziente associato
 * @property isLoading - Indica se i dati sono ancora in caricamento
 */
type RecentExercisesProps = {
  exercises: {
    id: number;
    titolo?: string;
    dataAssegnazione?: string;
    statoCompletamento?: string | null;
    patientName: string;
    patientCf: string;
  }[];
  isLoading: boolean;
};

/**
 * Formatta una data in formato locale italiano (gg MMM aaaa).
 * @param value - Stringa della data da formattare
 * @returns Data formattata o trattino se non valida
 */
function formatLocalDate(value?: string) {
  // Se il valore non è presente, restituisce un trattino
  if (!value) return "-";
  // Converte in oggetto Date
  const date = new Date(value);
  // Se la data non è valida, restituisce il valore originale
  if (Number.isNaN(date.getTime())) return value;
  // Formatta in locale italiano con giorno, mese abbreviato e anno
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Componente che mostra gli ultimi 5 esercizi assegnati.
 * Utilizzato nella dashboard del logopedista per un riepilogo rapido.
 * Ordina gli esercizi per data di assegnazione decrescente.
 * @param exercises - Array di esercizi da visualizzare
 * @param isLoading - Flag di caricamento
 */
export default function RecentExercises({
  exercises,
  isLoading,
}: RecentExercisesProps) {
  // Ordina gli esercizi per data di assegnazione (più recenti prima) e prende i primi 5
  const recentExercises = [...exercises]
    .sort(
      (a, b) =>
        new Date(b.dataAssegnazione || 0).getTime() -
        new Date(a.dataAssegnazione || 0).getTime()
    )
    .slice(0, 5);

  return (
    // Card con bordo blu chiaro e ombra
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      {/* Header con titolo e badge informativo */}
      <div className="flex items-center justify-between mb-4">
        {/* Titolo della sezione */}
        <h2 className="text-lg font-semibold text-blue-900">
          Ultimi esercizi assegnati
        </h2>
        {/* Badge che indica il limite */}
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          Ultimi 5
        </span>
      </div>
      {/* Contenuto condizionale in base allo stato */}
      {isLoading ? (
        // Messaggio durante il caricamento
        <p className="text-sm text-gray-600">Caricamento esercizi...</p>
      ) : recentExercises.length === 0 ? (
        // Messaggio quando non ci sono esercizi recenti
        <p className="text-sm text-gray-600">
          Nessun esercizio assegnato di recente.
        </p>
      ) : (
        // Tabella degli esercizi recenti
        <div className="space-y-3">
          {/* Header della griglia a 12 colonne */}
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {/* Colonna titolo (4 colonne) */}
            <span className="col-span-4">Titolo</span>
            {/* Colonna paziente (3 colonne) */}
            <span className="col-span-3">Paziente</span>
            {/* Colonna data (3 colonne) */}
            <span className="col-span-3">Data</span>
            {/* Colonna stato (2 colonne, allineato a destra) */}
            <span className="col-span-2 text-right">Stato</span>
          </div>
          {/* Corpo della griglia con separatori */}
          <div className="divide-y divide-gray-100">
            {/* Itera ogni esercizio e lo renderizza come riga */}
            {recentExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="grid grid-cols-12 items-center py-3 text-sm"
              >
                {/* Link al dettaglio dell'esercizio assegnato */}
                <Link
                  href={`/logopedista/lista-pazienti/dettaglio-paziente/${exercise.patientCf}/esercizio/${exercise.id}`}
                  className="col-span-4 font-semibold text-gray-900 hover:text-blue-700"
                >
                  {/* Titolo dell'esercizio o placeholder */}
                  {exercise.titolo || "Esercizio senza titolo"}
                </Link>
                {/* Link alla pagina di dettaglio del paziente */}
                <Link
                  href={`/logopedista/lista-pazienti/dettaglio-paziente/${exercise.patientCf}`}
                  className="col-span-3 font-semibold text-gray-900 hover:text-blue-700"
                >
                  {/* Nome del paziente */}
                  {exercise.patientName}
                </Link>
                {/* Data di assegnazione formattata */}
                <span className="col-span-3 text-gray-600">
                  {formatLocalDate(exercise.dataAssegnazione)}
                </span>
                {/* Stato di completamento */}
                <span className="col-span-2 text-right text-gray-700">
                  {exercise.statoCompletamento || "da-svolgere"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
