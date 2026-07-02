// Importazione del componente Link di Next.js per la navigazione
import Link from "next/link";

/**
 * Tipo delle props del componente PatientsToFollow.
 * @property patients - Array di pazienti con cf, nome, cognome e numero esercizi in sospeso
 * @property isLoading - Indica se i dati sono ancora in caricamento
 */
type PatientsToFollowProps = {
  patients: { cf: string; nome: string; cognome: string; pending: number }[];
  isLoading: boolean;
};

/**
 * Componente che mostra l'elenco dei pazienti con esercizi in sospeso.
 * Utilizzato nella dashboard del logopedista per un riepilogo rapido.
 * @param patients - Array di pazienti da visualizzare
 * @param isLoading - Flag di caricamento
 */
export default function PatientsToFollow({
  patients,
  isLoading,
}: PatientsToFollowProps) {
  return (
    // Card con bordo blu chiaro e ombra
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      {/* Header con titolo e label */}
      <div className="flex items-center justify-between mb-4">
        {/* Titolo della sezione */}
        <h2 className="text-lg font-semibold text-blue-900">
          Pazienti da seguire oggi
        </h2>
        {/* Badge informativo */}
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          In sospeso
        </span>
      </div>
      {/* Contenuto condizionale in base allo stato di caricamento */}
      {isLoading ? (
        // Messaggio durante il caricamento dei dati
        <p className="text-sm text-gray-600">Caricamento elenco...</p>
      ) : patients.length === 0 ? (
        // Messaggio quando non ci sono pazienti con esercizi in sospeso
        <p className="text-sm text-gray-600">
          Nessun paziente con esercizi in sospeso al momento.
        </p>
      ) : (
        // Lista dei pazienti con separatori
        <div className="divide-y divide-gray-100">
          {/* Itera ogni paziente e lo renderizza come riga */}
          {patients.map((patient) => (
            <div
              key={patient.cf}
              className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Informazioni del paziente: nome e numero esercizi */}
              <div>
                {/* Nome e cognome del paziente */}
                <p className="text-sm font-semibold text-gray-900">
                  {patient.nome} {patient.cognome}
                </p>
                {/* Contatore esercizi in sospeso */}
                <p className="text-xs text-gray-600">
                  {patient.pending} esercizi in sospeso
                </p>
              </div>
              {/* Link alla pagina di dettaglio del paziente */}
              <Link
                href={`/logopedista/lista-pazienti/dettaglio-paziente/${patient.cf}`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Vai al dettaglio
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
