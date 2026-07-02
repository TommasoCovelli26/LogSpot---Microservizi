// Importa il componente Carosello per mostrare le immagini a scorrimento
import Carousel from '../ui/pubblica/carosello';
// Importa il font personalizzato Lusitana
import { lusitana } from '../ui/fonts';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';

/**
 * Pagina pubblica principale della sezione Paziente.
 * Mostra un carosello di immagini, il titolo dell'app LogSpot,
 * una breve presentazione e i link per la registrazione.
 * Corrisponde alla route '/paziente'.
 */
export default function Page() {
  return (
    // Container principale centrato verticalmente e orizzontalmente
    <main className="flex flex-col gap-6 items-center justify-center min-h-screen">
      
      {/* Componente Carosello: mostra le immagini a scorrimento automatico */}
      <Carousel />

      {/* Sezione di presentazione con titolo e sottotitolo */}
      <header className="text-center">
        {/* Titolo principale dell'app con font Lusitana */}
        <h1 className={`${lusitana.className} text-5xl text-blue-600 md:text-6xl font-bold`}>
          LogSpot
        </h1>
        {/* Sottotitolo descrittivo della piattaforma */}
        <p className="text-lg text-gray-600 mt-4">La piattaforma centralizzata per la logopedia italiana. 
        Un unico archivio per professionisti, un supporto reale per i pazienti.</p>
      </header>

      {/* Sezione registrazione: due card per la scelta del tipo di utente */}
      <h2 className="text-center text-3xl font-bold text-gray-800 mt-8">Registrati come...</h2>
      <section className="grid gap-4 md:grid-cols-2 text-center max-w-4xl w-full px-4">
        {/* Card registrazione logopedista */}
        <Link href="/registrazione-logopedista" className="p-4 border rounded-lg bg-gray-50 hover:bg-blue-100 transition-colors cursor-pointer">
          <h3 className="font-bold text-blue-500">Logopedista</h3>
          <p className="text-sm">Gestisci i tuoi pazienti e crea attività personalizzate in pochi click.</p>
        </Link>
        {/* Card registrazione paziente */}
        <Link href="/registrazione-paziente" className="p-4 border rounded-lg bg-gray-50 hover:bg-blue-100 transition-colors cursor-pointer">
          <h3 className="font-bold text-blue-500">Paziente</h3>
          <p className="text-sm">Accedi ai tuoi esercizi e segui il tuo percorso riabilitativo ovunque sei.</p>
        </Link>
      </section>
    </main>
  );
}