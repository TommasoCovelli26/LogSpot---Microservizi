// Importa il componente Search per la barra di ricerca
import Search from '@/ui/logopedista/search';
// Importa il font personalizzato Lusitana
import { lusitana } from '@/ui/fonts';
// Importa la funzione per recuperare i pazienti non ancora assegnati a un logopedista
import { fetchUnassignedPatients } from '@/lib/patients';
// Importa la server action per assegnare un paziente a un logopedista
import { assignPatientToLogopedist } from '@/lib/actions';
// Importa il componente Suspense da React per il caricamento asincrono
import { Suspense } from 'react';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa la funzione cookies per accedere ai cookie HTTP lato server
import { cookies } from 'next/headers';

/**
 * Interfaccia TypeScript che definisce la struttura di un paziente.
 * Rappresenta i dati della tabella Paziente nel database.
 */
interface Patient {
  cf: string;                    // Codice Fiscale del paziente (chiave primaria)
  nome: string;                  // Nome del paziente
  cognome: string;               // Cognome del paziente
  email: string;                 // Email del paziente
  numTelefono: string | null;    // Numero di telefono (può essere null)
  dataNascita: string | null;    // Data di nascita (può essere null)
}

/**
 * Componente server che renderizza la lista dei pazienti non assegnati.
 * Cerca per codice fiscale e mostra una tabella con pulsante "Abbina"
 * per ogni paziente trovato senza logopedista.
 * @param query - Termine di ricerca (codice fiscale)
 * @param pIva - P.IVA del logopedista che sta abbinando il paziente
 */
async function UnassignedPatientsList({ query, pIva }: { query: string; pIva: string }) {
  // Se non è stato inserito un termine di ricerca, mostra un messaggio informativo
  if (!query || !query.trim()) {
    return (
      <div className="mt-6 text-center py-10 text-gray-500">
        Inserisci un codice fiscale per cercare pazienti
      </div>
    );
  }

  // Recupera i pazienti non assegnati che corrispondono alla ricerca
  const patients = await fetchUnassignedPatients(query);

  // Se nessun paziente corrisponde alla ricerca, mostra un messaggio
  if (patients.length === 0) {
    return (
      <div className="mt-6 text-center py-10 text-gray-500">
        Nessun paziente trovato senza logopedista assegnato
      </div>
    );
  }

  return (
    // Container tabella con bordi arrotondati e overflow per tabelle larghe
    <div className="mt-6 overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Tabella dei pazienti non assegnati */}
      <table className="w-full border-collapse">
        {/* Intestazione della tabella */}
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Codice Fiscale</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Cognome</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Telefono</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Azioni</th>
          </tr>
        </thead>
        {/* Corpo della tabella: itera sui pazienti trovati */}
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.cf} className="border-b hover:bg-gray-50">
              {/* Colonna Codice Fiscale */}
              <td className="px-4 py-3 text-sm text-gray-700">{patient.cf}</td>
              {/* Colonna Nome */}
              <td className="px-4 py-3 text-sm text-gray-700">{patient.nome}</td>
              {/* Colonna Cognome */}
              <td className="px-4 py-3 text-sm text-gray-700">{patient.cognome}</td>
              {/* Colonna Email */}
              <td className="px-4 py-3 text-sm text-gray-700">{patient.email}</td>
              {/* Colonna Telefono (mostra '-' se non disponibile) */}
              <td className="px-4 py-3 text-sm text-gray-700">{patient.numTelefono || '-'}</td>
              {/* Colonna Azioni: pulsante per abbinare il paziente al logopedista */}
              <td className="px-4 py-3 text-sm">
                {/* Form con server action per l'abbinamento paziente-logopedista */}
                <form
                  action={async () => {
                    'use server';
                    // Chiama la server action per assegnare il paziente al logopedista
                    await assignPatientToLogopedist(patient.cf, pIva);
                  }}
                >
                  {/* Pulsante "Abbina" per completare l'accoppiamento */}
                  <button
                    type="submit"
                    className="rounded-full bg-green-500 px-4 py-2 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-600 transition shadow-md"
                  >
                    Abbina
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Pagina principale di accoppiamento paziente.
 * Componente Server che recupera la P.IVA dal cookie, mostra la barra di ricerca
 * e la lista dei pazienti non assegnati.
 * Corrisponde alla route '/logopedista/lista-pazienti/accoppiamento-paziente'.
 */
export default async function Page({
  searchParams,
}: {
  // I searchParams sono una Promise in Next.js 15+
  searchParams: Promise<{
    query?: string;  // Termine di ricerca (codice fiscale)
  }>;
}) {
  // Await dei parametri di ricerca dalla query string
  const params = await searchParams;
  // Estrae il termine di ricerca (default: stringa vuota)
  const query = params?.query || '';
  
  // Recupero della P.IVA del logopedista dai cookie HTTP
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  // Variabile per memorizzare la P.IVA
  let pIva = '';

  // Se il cookie esiste, estrae la P.IVA dal JSON
  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie.value);
      // Estrae la P.IVA dell'utente loggato
      pIva = userData.utente?.pIva || userData.utente?.PIva || userData.utente?.codice || '';
    } catch (error) {
      console.error('Errore parsing cookie:', error);
    }
  }

  // Se la P.IVA non è disponibile, mostra un messaggio di errore
  if (!pIva) {
      return <div className="p-8 text-center text-red-500">Errore: Utente non identificato. Effettua nuovamente il login.</div>;
  }

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      {/* Container centrato con larghezza massima responsiva */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        {/* Header: titolo e pulsante indietro */}
        <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {/* Titolo della pagina con font Lusitana */}
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-yellow-400 font-bold`}>
              Accoppiamento Paziente
            </h1>
            {/* Sottotitolo descrittivo */}
            <p className="text-gray-500 mt-2">
              Cerca un paziente non assegnato e abbinalo al logopedista.
            </p>
          </div>
          {/* Pulsante per tornare alla lista pazienti */}
          <Link
            href="/logopedista/lista-pazienti"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-full font-bold uppercase text-xs hover:bg-gray-700 transition shadow-md tracking-wider"
          >
            Indietro
          </Link>
        </div>
        {/* Barra di ricerca per cercare pazienti per codice fiscale */}
        <div className="w-full mb-6">
          <Search placeholder="Cerca per codice fiscale..." />
        </div>
        {/* Suspense: mostra un indicatore di caricamento mentre la lista viene renderizzata */}
        {/* La key cambia quando la query cambia, forzando il re-render */}
        <Suspense key={query} fallback={<div className="mt-6 text-center py-10 text-gray-500">Caricamento...</div>}>
          {/* Componente lista pazienti non assegnati con la P.IVA del logopedista */}
          <UnassignedPatientsList query={query} pIva={pIva} />
        </Suspense>
      </div>
    </main>
  );
}