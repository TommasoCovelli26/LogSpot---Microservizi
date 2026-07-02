// Importazione del componente Link per la navigazione interna
import Link from "next/link";

/**
 * Tipo delle props del componente NextExerciseCard.
 * @property exercise - Esercizio opzionale con id, titolo e data di assegnazione
 */
type NextExerciseCardProps = {
  exercise?: { id: number; titolo?: string; dataAssegnazione?: string };
};

/**
 * Formatta una data nel formato locale italiano (es. "01 gen 2025").
 * Restituisce "-" se il valore non è fornito, o il valore originale se non è una data valida.
 * @param value - Stringa data opzionale in formato ISO
 * @returns Data formattata o placeholder
 */
function formatLocalDate(value?: string) {
  // Se il valore non è fornito, restituisce un trattino
  if (!value) return "-";
  // Crea un oggetto Date dalla stringa
  const date = new Date(value);
  // Se la data non è valida, restituisce il valore originale
  if (Number.isNaN(date.getTime())) return value;
  // Formatta la data in italiano con giorno, mese abbreviato e anno
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Componente card che mostra il prossimo esercizio da fare per il paziente.
 * Se non ci sono esercizi in corso, mostra un messaggio di congratulazioni.
 * @param exercise - Dati dell'esercizio da mostrare (opzionale)
 */
export default function NextExerciseCard({
  exercise,
}: NextExerciseCardProps) {
  return (
    // Card con bordo blu chiaro e ombra
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      {/* Layout flex verticale su mobile, orizzontale su tablet+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Etichetta superiore in blu */}
          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
            Prossimo esercizio da fare
          </p>
          {/* Contenuto condizionale: mostra esercizio o messaggio vuoto */}
          {exercise ? (
            <>
              {/* Titolo dell'esercizio o fallback se mancante */}
              <p className="text-lg font-semibold text-blue-900 mt-2">
                {exercise.titolo || "Esercizio senza titolo"}
              </p>
              {/* Data di assegnazione formattata */}
              <p className="text-xs text-gray-600 mt-1">
                Assegnato il {formatLocalDate(exercise.dataAssegnazione)}
              </p>
            </>
          ) : (
            // Messaggio quando non ci sono esercizi in corso
            <p className="text-sm text-gray-600 mt-2">
              Non ci sono esercizi in corso. Ottimo lavoro!
            </p>
          )}
        </div>
        {/* Pulsante per iniziare l'esercizio, visibile solo se presente */}
        {exercise && (
          <Link
            href={`/paziente/esercizi/${exercise.id}`}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Inizia ora
          </Link>
        )}
      </div>
    </div>
  );
}
