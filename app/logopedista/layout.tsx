// Importa il componente SideNav (barra di navigazione laterale) dalla cartella UI pubblica
import SideNav from '../ui/pubblica/sidenav';

/**
 * Layout condiviso per tutte le pagine della sezione Logopedista.
 * Racchiude le pagine: i miei materiali, crea attività, lista pazienti, ricerca materiali, ecc.
 * Struttura: barra laterale a sinistra + contenuto principale a destra.
 * @param children - I componenti figli renderizzati nella sezione contenuto (le pagine del logopedista)
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Container principale: layout a colonne (verticale su mobile, orizzontale su desktop)
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* Colonna di sinistra: la barra di navigazione laterale (SideNav) */}
      {/* Larghezza fissa 256px su desktop (md:w-64), larghezza piena su mobile */}
      <div className="w-full flex-none md:w-64">
        {/* Renderizza il componente SideNav con i link di navigazione */}
        <SideNav />
      </div>
      
      {/* Colonna di destra: il contenuto delle pagine del logopedista */}
      {/* Occupa tutto lo spazio rimanente (flex-grow), con padding e scroll verticale su desktop */}
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {/* Renderizza il contenuto della pagina corrente del logopedista */}
        {children}
      </div>
    </div>
  );
}