/**
 * Tipo delle props del componente DashboardStats del paziente.
 * @property total - Numero totale di esercizi assegnati
 * @property completed - Numero di esercizi completati
 * @property inProgress - Numero di esercizi in corso
 * @property isLoading - Indica se i dati sono in caricamento
 */
type DashboardStatsProps = {
  total: number;
  completed: number;
  inProgress: number;
  isLoading: boolean;
};

/**
 * Tipo delle props della card di riepilogo singola.
 * @property title - Titolo della statistica
 * @property value - Valore numerico o stringa
 * @property description - Breve descrizione della statistica
 */
type SummaryCardProps = {
  title: string;
  value: string | number;
  description: string;
};

/**
 * Componente interno per una singola card di riepilogo statistico.
 * Mostra titolo, valore numerico grande e descrizione.
 * @param title - Titolo della statistica
 * @param value - Valore da mostrare in grande
 * @param description - Testo descrittivo
 */
function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    // Card con bordo blu chiaro e ombra
    <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      {/* Titolo della statistica in maiuscolo */}
      <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
        {title}
      </p>
      {/* Valore numerico grande in blu scuro */}
      <p className="text-3xl font-bold text-blue-900 mt-2">
        {value}
      </p>
      {/* Descrizione aggiuntiva in grigio */}
      <p className="text-xs text-gray-600 mt-2">{description}</p>
    </div>
  );
}

/**
 * Componente panoramica statistiche della dashboard paziente.
 * Mostra 3 card di riepilogo: esercizi totali, completati e in corso.
 * @param total - Esercizi totali
 * @param completed - Esercizi completati
 * @param inProgress - Esercizi in corso
 * @param isLoading - Flag caricamento
 */
export default function DashboardStats({
  total,
  completed,
  inProgress,
  isLoading,
}: DashboardStatsProps) {
  return (
    // Griglia responsive: 1 colonna mobile, 2 tablet, 3 desktop
    <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
      {/* Card totale esercizi assegnati */}
      <SummaryCard
        title="Esercizi totali"
        value={isLoading ? "..." : total}
        description="Totale degli esercizi assegnati"
      />
      {/* Card esercizi completati */}
      <SummaryCard
        title="Esercizi completati"
        value={isLoading ? "..." : completed}
        description="Esercizi conclusi con esito registrato"
      />
      {/* Card esercizi in corso */}
      <SummaryCard
        title="Esercizi in corso"
        value={isLoading ? "..." : inProgress}
        description="Esercizi avviati o in attesa di completamento"
      />
    </div>
  );
}
