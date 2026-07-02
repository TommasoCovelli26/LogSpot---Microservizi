/**
 * Tipo delle props del componente CompletionProgress.
 * @property percentage - Percentuale di completamento (0-100)
 * @property isLoading - Indica se i dati sono in caricamento
 * @property message - Messaggio motivazionale da mostrare sotto la barra
 */
type CompletionProgressProps = {
  percentage: number;
  isLoading: boolean;
  message: string;
};

/**
 * Componente barra di progresso per il completamento degli esercizi del paziente.
 * Mostra una barra percentuale animata e un messaggio informativo.
 * @param percentage - Percentuale completata
 * @param isLoading - Flag caricamento
 * @param message - Messaggio da mostrare
 */
export default function CompletionProgress({
  percentage,
  isLoading,
  message,
}: CompletionProgressProps) {
  return (
    // Card con bordo blu chiaro e ombra
    <div className="mb-6 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      {/* Header con etichetta e percentuale */}
      <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
        {/* Etichetta della barra */}
        <span>Completamento esercizi</span>
        {/* Percentuale o placeholder di caricamento */}
        <span>{isLoading ? "..." : `${percentage}%`}</span>
      </div>
      {/* Barra di progresso con sfondo blu chiaro */}
      <div className="mt-2 h-2 w-full rounded-full bg-blue-100">
        {/* Riempimento della barra proporzionale alla percentuale */}
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{ width: `${isLoading ? 0 : percentage}%` }}
        />
      </div>
      {/* Messaggio informativo/motivazionale sotto la barra */}
      <p className="mt-3 text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
        {message}
      </p>
    </div>
  );
}
