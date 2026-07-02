// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'icona X per il pulsante di chiusura
import { XMarkIcon } from '@heroicons/react/24/outline';
// Importazione dell'hook useEffect per gestire effetti collaterali
import { useEffect } from 'react';

/**
 * Interfaccia delle props del componente ImageModal.
 * @property src - URL dell'immagine da mostrare (null = modale chiusa)
 * @property onClose - Callback invocata alla chiusura della modale
 */
interface Props {
  src: string | null;
  onClose: () => void;
}

/**
 * Componente modale per visualizzare un'immagine a schermo intero.
 * Si chiude cliccando sullo sfondo, sul pulsante X o premendo ESC.
 * @param src - URL dell'immagine (null per nascondere)
 * @param onClose - Funzione di chiusura
 */
export default function ImageModal({ src, onClose }: Props) {
  // Effetto per chiudere la modale con il tasto ESC
  useEffect(() => {
    // Handler per l'evento keydown: chiude con Escape
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // Registra l'event listener sulla finestra
    window.addEventListener('keydown', handleEsc);
    // Rimuove l'event listener al cleanup
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Se src è null, non renderizza nulla (modale chiusa)
  if (!src) return null;

  return (
    // Overlay a schermo intero con sfondo nero semitrasparente
    <div 
      className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose} // Chiudi cliccando sullo sfondo scuro
    >
      {/* Pulsante di chiusura posizionato in alto a destra */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/30 rounded-full p-2 transition text-white"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      {/* Immagine a schermo intero con dimensione massima vincolata */}
      <img 
        src={src} 
        alt="Full screen view" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg cursor-default"
        onClick={(e) => e.stopPropagation()} // Evita la chiusura se si clicca sull'immagine stessa
      />
    </div>
  );
}