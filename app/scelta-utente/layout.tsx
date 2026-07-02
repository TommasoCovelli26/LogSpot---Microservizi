// Importa il componente SideNav (barra di navigazione laterale) dalla cartella UI pubblica
import SideNav from '../ui/pubblica/sidenav';

/**
 * Layout condiviso per la pagina di scelta tipo utente (prima della registrazione).
 * Riutilizza lo stesso layout delle pagine pubbliche con SideNav laterale.
 * Struttura: barra laterale a sinistra + contenuto di scelta utente a destra.
 * @param children - Il componente figlio (pagina scelta utente) renderizzato nella sezione contenuto
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Container principale: layout a colonne (verticale su mobile, orizzontale su desktop)
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* Colonna di sinistra: la barra di navigazione laterale (SideNav) */}
      {/* Larghezza fissa 256px su desktop (md:w-64), larghezza piena su mobile */}
      <div className="w-full flex-none md:w-64">
        {/* Renderizza il componente SideNav con i link di navigazione pubblica */}
        <SideNav />
      </div>
      
      {/* Colonna di destra: il contenuto della pagina di scelta utente */}
      {/* Occupa tutto lo spazio rimanente (flex-grow), con padding e scroll verticale su desktop */}
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {/* Renderizza il contenuto della pagina di scelta utente */}
        {children}
      </div>
    </div>
  );
}