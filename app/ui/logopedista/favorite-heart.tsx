// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'hook useState per gestire lo stato locale
import { useState } from 'react';
// Importazione dell'icona cuore vuoto (outline)
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
// Importazione dell'icona cuore pieno (solid)
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
// Importazione della Server Action per toggle dei preferiti
import { toggleFavorite } from '../../lib/actions';

/**
 * Tipo delle props del componente FavoriteHeart.
 * @property id - ID identificativo dell'attività
 * @property initialStatus - Stato iniziale del preferito (true = preferito)
 * @property onToggle - Callback opzionale invocata dopo il toggle
 */
type FavoriteHeartProps = {
  id: string;
  initialStatus: boolean;
  onToggle?: (id: string, isFavorite: boolean) => void;
};

/**
 * Componente cuore per aggiungere/rimuovere un'attività dai preferiti.
 * Utilizza aggiornamento ottimistico con rollback in caso di errore.
 * @param id - ID dell'attività
 * @param initialStatus - Stato iniziale del preferito
 * @param onToggle - Callback opzionale post-toggle
 */
export default function FavoriteHeart({ id, initialStatus, onToggle }: FavoriteHeartProps) {
  // Stato locale del preferito, inizializzato con lo stato dal server
  const [isFavorite, setIsFavorite] = useState(initialStatus);

  /**
   * Gestisce il click sul cuore con aggiornamento ottimistico.
   * Aggiorna subito l'UI, poi sincronizza con il server.
   */
  const handleClick = async () => {
    // Aggiornamento ottimistico: inverte lo stato locale immediatamente
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    try {
      // Sincronizza con il server tramite Server Action
      await toggleFavorite(id, newStatus);
      // Notifica il componente padre del cambiamento (se callback fornita)
      onToggle?.(id, newStatus);
    } catch (e) {
      // Logga l'errore in console
      console.error("Errore preferiti");
      // Rollback: ripristina lo stato precedente in caso di errore
      setIsFavorite(!newStatus);
    }
  };

  return (
    // Pulsante cuore che blocca la propagazione del click
    <button 
      onClick={(e) => {
          // Previene la propagazione per non attivare click sulla riga
          e.stopPropagation();
          // Invoca il gestore del click
          handleClick();
      }}
      className="focus:outline-none transition-transform active:scale-110"
    >
      {/* Mostra cuore pieno rosso se preferito, cuore vuoto grigio altrimenti */}
      {isFavorite ? (
        <HeartSolid className="w-6 h-6 text-red-500" />
      ) : (
        <HeartOutline className="w-6 h-6 text-gray-300 hover:text-red-400" />
      )}
    </button>
  );
}