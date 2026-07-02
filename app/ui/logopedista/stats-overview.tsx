/**
 * Tipo delle props del componente StatsOverview.
 * @property patients - Numero totale di pazienti attivi
 * @property assigned - Numero totale di esercizi assegnati
 * @property completedToday - Numero di esercizi completati oggi
 * @property inProgress - Numero di esercizi attualmente in corso
 * @property isLoading - Indica se i dati sono in caricamento
 */
type StatsOverviewProps = {
  patients: number;
  assigned: number;
  completedToday: number;
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
 * @param description - Testo descrittivo sotto il valore
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
 * Componente panoramica statistiche della dashboard logopedista.
 * Mostra 4 card di riepilogo: pazienti, esercizi assegnati, completati oggi, in corso.
 * @param patients - Numero pazienti
 * @param assigned - Numero assegnazioni
 * @param completedToday - Completati oggi
 * @param inProgress - In corso
 * @param isLoading - Flag caricamento
 */
export default function StatsOverview({
  patients,
  assigned,
  completedToday,
  inProgress,
  isLoading,
}: StatsOverviewProps) {
  return (
    // Griglia responsive: 1 colonna mobile, 2 tablet, 4 desktop
    <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card totale pazienti */}
      <SummaryCard
        title="Totale pazienti"
        value={isLoading ? "..." : patients}
        description="Pazienti attivi assegnati"
      />
      {/* Card esercizi assegnati */}
      <SummaryCard
        title="Esercizi assegnati"
        value={isLoading ? "..." : assigned}
        description="Assegnazioni complessive"
      />
      {/* Card completati nella giornata */}
      <SummaryCard
        title="Completati oggi"
        value={isLoading ? "..." : completedToday}
        description="Completati nella giornata"
      />
      {/* Card esercizi in svolgimento */}
      <SummaryCard
        title="Esercizi in corso"
        value={isLoading ? "..." : inProgress}
        description="In svolgimento o in attesa"
      />
    </div>
  );
}
