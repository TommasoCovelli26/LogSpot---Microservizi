// Importa il componente Carousel (carosello di immagini) dalla cartella UI pubblica
import Carousel from '../ui/pubblica/carosello';
// Importa il font personalizzato Lusitana dal modulo fonts
import { lusitana } from '../ui/fonts';
// Importa il componente Link di Next.js per la navigazione client-side
import Link from 'next/link';

/**
 * Pagina principale (Homepage) della sezione pubblica del sito.
 * Mostra il carosello di immagini, il titolo dell'applicazione, una breve descrizione
 * e due card per la registrazione come logopedista o paziente.
 * Corrisponde alla route '/' (root del route group pubblica).
 */
export default function Page() {
  return (
    // Container principale: layout verticale centrato, altezza minima schermo intero
    <main className="flex flex-col gap-6 items-center justify-center min-h-screen">
      
      {/* Componente Carosello: mostra le immagini della piattaforma in rotazione */}
      <Carousel />

      {/* Sezione di presentazione: titolo dell'app e descrizione */}
      <header className="text-center">
        {/* Titolo principale con font Lusitana, colore blu, dimensione responsive */}
        <h1 className={`${lusitana.className} text-5xl text-blue-600 md:text-6xl font-bold`}>
          LogSpot
        </h1>
        {/* Sottotitolo descrittivo della piattaforma */}
        <p className="text-lg text-gray-600 mt-4">La piattaforma centralizzata per la logopedia italiana. 
        Un unico archivio per professionisti, un supporto reale per i pazienti.</p>
      </header>

      {/* Titolo della sezione di registrazione */}
      <h2 className="text-center text-3xl font-bold text-gray-800 mt-8">Registrati come...</h2>
      {/* Griglia con due card per la scelta del tipo di registrazione */}
      <section className="grid gap-4 md:grid-cols-2 text-center max-w-4xl w-full px-4">
        {/* Card per la registrazione come Logopedista: link alla pagina registrazione con ruolo=logopedista */}
        <Link
          href="/registrazione?ruolo=logopedista"
          className="p-4 border rounded-lg bg-gray-50 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          {/* Titolo della card Logopedista */}
          <h3 className="font-bold text-blue-500">Logopedista</h3>
          {/* Descrizione dei vantaggi per il logopedista */}
          <p className="text-sm">Gestisci i tuoi pazienti e crea attività personalizzate in pochi click.</p>
        </Link>
        {/* Card per la registrazione come Paziente: link alla pagina registrazione con ruolo=paziente */}
        <Link
          href="/registrazione?ruolo=paziente"
          className="p-4 border rounded-lg bg-gray-50 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          {/* Titolo della card Paziente */}
          <h3 className="font-bold text-blue-500">Paziente</h3>
          {/* Descrizione dei vantaggi per il paziente */}
          <p className="text-sm">Accedi ai tuoi esercizi e segui il tuo percorso riabilitativo ovunque sei.</p>
        </Link>
      </section>
    </main>
  );
}