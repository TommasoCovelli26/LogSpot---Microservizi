// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione del componente Link di Next.js per la navigazione
import Link from 'next/link';
// Importazione degli hook React per stato e effetti collaterali
import { useState, useEffect } from 'react';
// Importazione delle icone lente e più da Heroicons (outline)
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
// Importazione dell'icona cuore vuoto (outline)
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'; // Cuore vuoto
// Importazione dell'icona cuore pieno (solid)
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';     // Cuore pieno
// Importazione della libreria per classi CSS condizionali
import clsx from 'clsx';
// Importazione del font personalizzato Lusitana
import { lusitana } from '../fonts';
// Importazione della Server Action per aggiungere/rimuovere dai preferiti
import { toggleFavorite } from '../../lib/actions'; // Importiamo la server action
// Importazione del tipo ActivityWithFavorite dalle utility condivise
import type { ActivityWithFavorite } from '../../lib/activities';

/**
 * Componente lista dashboard del logopedista.
 * Mostra le attività con funzionalità di ricerca, tab (recenti/preferiti)
 * e toggle dei preferiti con aggiornamento ottimistico.
 * @param activities - Array di attività con informazione sui preferiti
 */
export default function DashboardList({ activities }: { activities: ActivityWithFavorite[] }) {
  // Stato per il tab attivo: 'recenti' mostra tutte, 'preferiti' solo i preferiti
  const [activeTab, setActiveTab] = useState('recenti'); // Solo: recenti | preferiti
  // Stato per la query di ricerca testuale
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stato locale delle attività per gestire l'UI reattiva (feedback immediato al click)
  const [localActivities, setLocalActivities] = useState(activities);

  // Se i dati dal server cambiano (es. dopo revalidatePath), aggiorniamo lo stato locale
  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  /**
   * Gestisce il click sull'icona cuore per aggiungere/rimuovere dai preferiti.
   * Usa un pattern di aggiornamento ottimistico: aggiorna prima l'UI, poi il server.
   * @param cod - Codice dell'attività
   * @param currentStatus - Stato attuale del preferito (true/false)
   */
  const handleToggleHeart = async (id: string, currentStatus: boolean) => {
    // 1. Aggiornamento Ottimistico (Immediato sull'interfaccia)
    const newStatus = !currentStatus;
    // Aggiorna lo stato locale invertendo il flag isFavorite per l'attività specificata
    setLocalActivities((prev) => 
      prev.map((act) => 
        act.id === id ? { ...act, isFavorite: newStatus } : act
      )
    );

    // 2. Aggiornamento Database (Server Action)
    try {
      // Invoca la server action per persistere la modifica nel database
      await toggleFavorite(id, newStatus);
    } catch (e) {
      // Se fallisce, logga l'errore (potremmo anche annullare la modifica locale)
      console.error("Errore salvataggio preferito");
    }
  };

  /**
   * Calcola il tempo trascorso dalla data data e restituisce una stringa leggibile.
   * @param dateString - Stringa della data da convertire
   * @returns Stringa formattata (es. "5m fa", "3h fa", "IERI", o data locale)
   */
  const timeAgo = (dateString: string) => {
    // Converte la stringa in oggetto Date
    const date = new Date(dateString);
    // Ottiene il timestamp corrente
    const now = new Date();
    // Calcola la differenza in secondi
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    // Se meno di un'ora, mostra i minuti
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m fa`;
    // Se meno di un giorno, mostra le ore
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h fa`;
    // Se meno di due giorni, mostra "IERI"
    if (seconds < 172800) return "IERI";
    // Altrimenti mostra la data formattata in italiano
    return date.toLocaleDateString('it-IT');
  };

  // LOGICA DI FILTRO: filtra le attività in base alla ricerca e al tab attivo
  const filteredActivities = localActivities.filter((act) => {
    // 1. Filtro Ricerca: verifica se il titolo contiene la query (case-insensitive)
    const matchesSearch = act.titolo.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Filtro Tab Preferiti: nel tab 'preferiti' mostra solo quelli con isFavorite true
    const matchesTab = activeTab === 'preferiti' ? act.isFavorite : true;

    // L'attività deve soddisfare entrambi i filtri
    return matchesSearch && matchesTab;
  });

  return (
    // Container principale centrato con larghezza massima
    <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
      
      {/* SEZIONE SUPERIORE: pulsante per creare nuova attività */}
      <div className="w-full flex flex-col items-center mb-8 mt-4">
        {/* Icona decorativa con bordo giallo */}
        <div className="relative mb-4">
            <div className="w-72 h-42 border-4 border-yellow-400 rounded-xl flex items-center justify-center bg-gray-50 shadow-sm">
                <PlusIcon className="w-10 h-10 text-yellow-500" />
            </div>
            {/* Ombra decorativa sotto l'icona */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400 rounded-full"></div>
        </div>
        {/* Link per navigare alla pagina di creazione attività */}
        <Link href="/logopedista/crea">
          <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 transition-colors text-black font-bold py-3 px-8 rounded-xl shadow-md text-lg">
            <PlusIcon className="w-6 h-6" />
            NUOVA ATTIVITÀ
          </button>
        </Link>
      </div>

      {/* SEZIONE TAB: toggle tra attività recenti e preferite */}
      <div className="flex gap-2 mb-6 w-full overflow-x-auto pb-2 justify-center md:justify-start">
        {/* Tab "Recenti": mostra tutte le attività */}
        <button
          onClick={() => setActiveTab('recenti')}
          className={clsx(
            "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
            activeTab === 'recenti' ? "bg-yellow-400 text-black shadow-md" : "bg-white text-gray-400 border border-gray-200"
          )}
        >
          RECENTI
        </button>
        {/* Tab "Preferiti": mostra solo le attività con cuore */}
        <button
          onClick={() => setActiveTab('preferiti')}
          className={clsx(
            "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
            activeTab === 'preferiti' ? "bg-yellow-400 text-black shadow-md" : "bg-white text-gray-400 border border-gray-200"
          )}
        >
          PREFERITI
        </button>
      </div>

      {/* BARRA DI RICERCA: campo di testo con icona lente */}
      <div className="w-full relative mb-6">
        {/* Icona lente posizionata a sinistra dell'input */}
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {/* Input di ricerca con padding per l'icona */}
        <input
          type="text"
          placeholder="CERCA..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-gray-600 focus:outline-none focus:border-yellow-400 shadow-sm"
        />
      </div>

      {/* LISTA ATTIVITÀ: tabella con header e righe */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header della tabella con colonne Nome e Ultima Modifica */}
        <div className="flex justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NOME</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ULTIMA MODIFICA</span>
        </div>

        {/* Corpo della lista con separatori tra le righe */}
        <div className="divide-y divide-gray-100">
          {filteredActivities.length > 0 ? (
            // Itera le attività filtrate e le renderizza come righe
            filteredActivities.map((act) => (
              <div key={act.id} className="flex justify-between items-center px-6 py-4 hover:bg-yellow-50 transition-colors group">
                {/* Colonna sinistra: icona cuore + nome attività */}
                <div className="flex items-center gap-3">
                  {/* Pulsante cuore interattivo per toggle preferiti */}
                  <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Evita di cliccare la riga intera se aggiungi link
                        // Invoca il toggle del preferito con lo stato attuale
                        handleToggleHeart(act.id, act.isFavorite);
                    }}
                    className="focus:outline-none transition-transform active:scale-110"
                  >
                    {/* Mostra cuore pieno rosso se preferito, vuoto grigio altrimenti */}
                    {act.isFavorite ? (
                      <HeartSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartOutline className="w-6 h-6 text-gray-300 hover:text-red-400" />
                    )}
                  </button>

                  {/* Titolo dell'attività con font Lusitana */}
                  <span className={`font-bold text-gray-800 ${lusitana.className} text-lg group-hover:text-black`}>
                    {act.titolo}
                  </span>
                </div>

                {/* Colonna destra: tempo trascorso dalla creazione */}
                <span className="text-gray-400 text-sm font-medium uppercase">
                  {timeAgo(act.dataCreazione)}
                </span>
              </div>
            ))
          ) : (
            // Messaggio quando non ci sono attività da mostrare
            <div className="p-6 text-center text-gray-400 italic">
              {/* Messaggio diverso in base al tab attivo */}
              {activeTab === 'preferiti' 
                ? "Non hai ancora aggiunto attività ai preferiti." 
                : "Nessuna attività trovata."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}