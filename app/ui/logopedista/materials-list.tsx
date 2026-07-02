// Importazione del componente Link di Next.js per la navigazione
import Link from 'next/link';
// Importazione del font personalizzato Lusitana
import { lusitana } from '../../ui/fonts';
// Importazione del componente cuore per i preferiti
import FavoriteHeart from './favorite-heart';
// Importazione del tipo ActivityWithFavorite per la tipizzazione
import { ActivityWithFavorite } from '../../lib/activities';

/**
 * Formatta una data in formato italiano (gg/mm/aaaa, hh:mm).
 * @param dateString - Stringa della data da formattare
 * @returns Stringa della data formattata nel locale italiano
 */
const formatDate = (dateString: string) => {
  // Converte la stringa in oggetto Date
  const date = new Date(dateString);
  // Formatta in locale italiano con giorno, mese, anno, ora e minuti
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Componente lista materiali riutilizzabile.
 * Mostra una tabella di attività con cuore preferiti, titolo e data.
 * Usato sia nella pagina "I miei materiali" che in "Ricerca materiali".
 * @param activities - Array di attività da mostrare
 * @param baseHref - Percorso base per i link di dettaglio (default: /logopedista/imieimateriali)
 * @param onFavoriteChange - Callback opzionale quando cambia un preferito
 */
export default function MaterialsList({
  activities,
  baseHref = '/logopedista/imieimateriali',
  onFavoriteChange
}: {
  activities: ActivityWithFavorite[];
  baseHref?: string;
  onFavoriteChange?: (cod: number, isFavorite: boolean) => void;
}) {
  return (
    // Container principale della tabella con bordo e ombra
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header della tabella con colonne Nome e Ultima Modifica */}
      <div className="flex justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NOME</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ULTIMA MODIFICA</span>
      </div>

      {/* Corpo della tabella con righe separate da bordi */}
      <div className="divide-y divide-gray-100">
        {activities.length > 0 ? (
          // Itera ogni attività e la renderizza come riga
          activities.map((act) => (
            // Container riga: div esterno per separare cuore e link
            <div 
              key={act.cod} 
              className="flex items-center hover:bg-yellow-50 transition-colors group relative"
            >
              
              {/* Cuore preferiti: posizionato fuori dal Link per evitare conflitti di click */}
              <div className="pl-6 pr-2 z-10">
                  <FavoriteHeart
                   cod={act.cod}
                   initialStatus={act.isFavorite}
                   onToggle={onFavoriteChange}
                  />
              </div>

              {/* Link al dettaglio: avvolge solo titolo e data, riempie il resto della riga */}
              <Link 
                href={`${baseHref}/${act.cod}`}
                className="flex-1 flex justify-between items-center py-4 pr-6 pl-2"
              >
                  {/* Titolo dell'attività con font Lusitana */}
                  <span className={`font-bold text-gray-800 ${lusitana.className} text-lg group-hover:text-black`}>
                    {act.titolo}
                  </span>

                  {/* Data dell'ultima modifica formattata */}
                  <span className="text-gray-400 text-sm font-medium uppercase">
                    {formatDate(act.dataCreazione)}
                  </span>
              </Link>

            </div>
          ))
        ) : (
          // Messaggio quando non ci sono attività
          <div className="p-6 text-center text-gray-400 italic">
            Nessuna attività trovata.
          </div>
        )}
      </div>
    </div>
  );
}