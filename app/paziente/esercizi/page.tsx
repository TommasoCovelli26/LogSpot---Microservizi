// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa gli hook React: Suspense per il lazy loading, useEffect per side-effects,
// useState per lo stato locale
import { Suspense, useEffect, useState } from 'react';
// Importa l'hook useRouter per la navigazione programmatica
import { useRouter } from 'next/navigation';
// Importa il componente tabs per filtrare gli esercizi (Tutti / In Corso / Completati)
import ExercisesTabs from '../../ui/paziente/exercises-tabs';
// Importa il componente barra di ricerca per gli esercizi
import ExercisesSearch from '../../ui/paziente/exercises-search';
// Importa il componente wrapper per la lista degli esercizi
import ExercisesListWrapper from '../../ui/paziente/exercises-list-wrapper';

/**
 * Pagina "I Miei Esercizi" del paziente.
 * Componente Client che mostra la lista degli esercizi assegnati al paziente
 * con filtri per stato (tutti/in corso/completati) e ricerca testuale.
 * Corrisponde alla route '/paziente/esercizi'.
 */
export default function Page() {
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Stato per memorizzare il codice fiscale del paziente loggato
  const [patientCf, setPatientCf] = useState<string | null>(null);

  // Effect: recupera il CF del paziente dalla sessione in localStorage
  useEffect(() => {
    // Legge i dati della sessione dal localStorage
    const utenteStr = localStorage.getItem('utente');
    // Se la sessione non esiste, reindirizza al login
    if (!utenteStr) {
      router.push('/login');
      return;
    }

    // Parsing dei dati utente dalla sessione
    const utente = JSON.parse(utenteStr);
    
    // Verifica che l'utente sia un paziente, altrimenti reindirizza alla dashboard
    if (utente.ruolo !== 'paziente') {
      router.push('/dashboard');
      return;
    }

    // Salva il codice fiscale del paziente nello stato (campo 'codice' nel localStorage)
    setPatientCf(utente.codice);
  }, [router]); // Si riesegue solo se il router cambia

  // Se il CF non è ancora disponibile, mostra un indicatore di caricamento
  if (!patientCf) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      {/* Container centrato con larghezza massima responsiva */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-4xl">
        
        {/* Header: titolo pagina e sottotitolo descrittivo */}
        <div className="w-full mb-6">
          <h1 className="text-3xl font-bold text-gray-900">I Miei Esercizi</h1>
          <p className="text-gray-500 mt-2">Visualizza e svolgi gli esercizi assegnati dal tuo logopedista</p>
        </div>

        {/* Tabs di filtro per stato: Tutti / In Corso / Completati */}
        <ExercisesTabs />

        {/* Barra di ricerca per cercare esercizi per titolo */}
        <ExercisesSearch />

        {/* Lista degli esercizi filtrati, riceve il CF del paziente */}
        <ExercisesListWrapper patientCf={patientCf} />

      </div>
    </main>
  );
}
