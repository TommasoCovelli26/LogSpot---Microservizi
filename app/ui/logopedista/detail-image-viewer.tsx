// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione dell'hook useState per gestire lo stato locale
import { useState } from 'react';
// Importazione dell'icona foto da Heroicons
import { PhotoIcon } from '@heroicons/react/24/outline';
// Importazione del componente modale per visualizzare le immagini a schermo intero
import ImageModal from '../image-modal';

/**
 * Componente per visualizzare le immagini allegate a un'attività.
 * Mostra una griglia di thumbnail cliccabili che aprono la modale a schermo intero.
 * Se non ci sono immagini, non renderizza nulla.
 * @param images - Array di stringhe base64 delle immagini allegate
 */
export default function DetailImageViewer({ images }: { images: string[] }) {
  // Stato per l'immagine correntemente aperta nella modale (null = modale chiusa)
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Se non ci sono immagini, non renderizza nulla
  if (images.length === 0) return null;

  return (
    <>
      {/* Componente modale per la visualizzazione a schermo intero dell'immagine */}
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      
      {/* Sezione immagini allegate con bordo superiore separatore */}
      <div className="mt-10 pt-6 border-t border-gray-100">
        {/* Titolo sezione con icona e contatore immagini */}
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-6 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5" /> Immagini Allegate ({images.length})
        </h4>
        {/* Griglia flessibile delle thumbnail */}
        <div className="flex flex-wrap gap-4">
            {/* Itera ogni immagine e la renderizza come thumbnail cliccabile */}
            {images.map((imgData, idx) => (
                <img 
                  key={idx} 
                  src={imgData}
                  alt={`Allegato ${idx + 1}`}
                  className="w-32 h-32 object-cover rounded-2xl border-2 border-yellow-200 shadow-sm cursor-pointer hover:opacity-90 hover:scale-105 transition bg-white"
                  onClick={() => setModalImage(imgData)}
                />
            ))}
        </div>
    </div>
    </>
  );
}