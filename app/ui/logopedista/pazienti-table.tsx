// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione del tipo Patient per la tipizzazione
import { Patient } from '@/lib/patients';
// Importazione della funzione helper per formattare le date
import { formatDateToLocal } from '@/lib/utils';
// Importazione del componente Link di Next.js per la navigazione
import Link from 'next/link';
// Importazione dell'hook useRouter per la navigazione programmatica
import { useRouter } from 'next/navigation';

/**
 * Componente tabella dei pazienti del logopedista.
 * Mostra una vista mobile (card) e una vista desktop (tabella) responsive.
 * Ogni riga è cliccabile e porta alla pagina di dettaglio del paziente.
 * @param patients - Array dei pazienti da visualizzare
 */
export default function PatientsTable({ patients }: { patients: any[] }) {
  // Hook per la navigazione programmatica
  const router = useRouter();

  // Se non ci sono pazienti, mostra un messaggio placeholder
  if (!patients || patients.length === 0) {
    return (
      // Messaggio centrato quando non ci sono risultati
      <div className="mt-6 text-center py-10">
        <p className="text-gray-500">Nessun paziente trovato</p>
      </div>
    );
  }

  /**
   * Gestisce il click su una riga della tabella desktop.
   * Naviga alla pagina di dettaglio del paziente.
   * @param cf - Codice fiscale del paziente
   */
  const handleRowClick = (cf: string) => {
    router.push(`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`);
  };

  return (
    // Container con flow-root per gestire i float
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        {/* Container con sfondo grigio e bordi arrotondati */}
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Vista mobile: card per ogni paziente (visibile solo su schermi piccoli) */}
          <div className="md:hidden">
            {patients.map((patient: any) => (
              // Link al dettaglio del paziente
              <Link
                key={patient.cf}
                href={`/logopedista/lista-pazienti/dettaglio-paziente/${patient.cf}`}
              >
                {/* Card mobile con informazioni del paziente */}
                <div
                  className="mb-2 w-full rounded-md bg-white p-4 cursor-pointer hover:bg-gray-50"
                >
                  {/* Sezione superiore: nome e email */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      {/* Nome e cognome del paziente */}
                      <div className="mb-2 flex items-center">
                        <p className="font-medium">{patient.nome} {patient.cognome}</p>
                      </div>
                      {/* Email del paziente */}
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                  {/* Sezione inferiore: CF, telefono e data nascita */}
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      {/* Codice fiscale */}
                      <p className="text-sm font-medium">CF: {patient.cf}</p>
                      {/* Numero di telefono (se presente) */}
                      {patient.numTelefono && (
                        <p className="text-sm text-gray-500">{patient.numTelefono}</p>
                      )}
                      {/* Data di nascita formattata (se presente) */}
                      {patient.dataNascita && (
                        <p className="text-sm text-gray-500">
                          {formatDateToLocal(patient.dataNascita)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Vista desktop: tabella (visibile solo su schermi medi e grandi) */}
          <table className="hidden min-w-full text-gray-900 md:table">
            {/* Intestazione della tabella */}
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {/* Colonna Cognome */}
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Cognome
                </th>
                {/* Colonna Nome */}
                <th scope="col" className="px-3 py-5 font-medium">
                  Nome
                </th>
                {/* Colonna Codice Fiscale */}
                <th scope="col" className="px-3 py-5 font-medium">
                  Codice Fiscale
                </th>
                {/* Colonna Email */}
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                {/* Colonna Telefono */}
                <th scope="col" className="px-3 py-5 font-medium">
                  Telefono
                </th>
                {/* Colonna Data Nascita */}
                <th scope="col" className="px-3 py-5 font-medium">
                  Data Nascita
                </th>
              </tr>
            </thead>
            {/* Corpo della tabella con sfondo bianco */}
            <tbody className="bg-white">
              {/* Itera ogni paziente come riga della tabella */}
              {patients.map((patient: any) => (
                <tr
                  key={patient.cf}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(patient.cf)}
                >
                  {/* Cella cognome */}
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {patient.cognome}
                  </td>
                  {/* Cella nome */}
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.nome}
                  </td>
                  {/* Cella codice fiscale con font monospace */}
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                    {patient.cf}
                  </td>
                  {/* Cella email */}
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.email}
                  </td>
                  {/* Cella telefono (trattino se assente) */}
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.numTelefono || '—'}
                  </td>
                  {/* Cella data nascita formattata (trattino se assente) */}
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.dataNascita
                      ? formatDateToLocal(patient.dataNascita)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}