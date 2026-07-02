// Importa il componente SideNav per la barra di navigazione laterale
import SideNav from '../ui/pubblica/sidenav';

/**
 * Layout della sezione Dashboard.
 * Struttura a due colonne: SideNav a sinistra e contenuto a destra.
 * Utilizzato sia dalla dashboard logopedista che da quella paziente.
 * Corrisponde alla route '/dashboard'.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Container principale: layout flex verticale su mobile, orizzontale su desktop
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* Colonna di sinistra: barra di navigazione laterale con larghezza fissa */}
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      
      {/* Colonna di destra: area contenuto scrollabile con padding */}
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}