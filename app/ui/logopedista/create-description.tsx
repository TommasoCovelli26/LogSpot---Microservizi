// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa l'hook useState per lo stato locale
import { useState } from 'react';
// Importa le icone Heroicons: foto per aggiungere immagini, X per rimuoverle
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
// Importa il componente modale per la visualizzazione a schermo intero
import ImageModal from '../image-modal';

/**
 * Interfaccia Props per il componente CreateDescription.
 * @property textValue - Il testo della descrizione attuale
 * @property onTextChange - Callback invocata quando il testo cambia
 * @property files - Array di stringhe Base64 (data:image...) delle immagini allegate
 * @property onAddFile - Callback per aggiungere nuovi file immagine
 * @property onRemoveFile - Callback per rimuovere un file immagine specifico
 */
interface Props {
  textValue: string;
  onTextChange: (val: string) => void;
  files: string[];
  onAddFile: (files: FileList | null) => void;
  onRemoveFile: (fileData: string) => void;
}

/**
 * Componente per inserire la descrizione dell'attività e allegare immagini.
 * Include una textarea per il testo, una galleria di miniature per le immagini
 * allegate, e un pulsante per aggiungere nuove immagini.
 * Le immagini possono essere visualizzate a schermo intero cliccandole.
 */
export default function CreateDescription({ textValue, onTextChange, files, onAddFile, onRemoveFile }: Props) {
  // Stato per l'immagine attualmente mostrata nel modale a schermo intero
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <>
      {/* Modale per la visualizzazione a schermo intero dell'immagine cliccata */}
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />

      {/* Container principale della sezione descrizione */}
      <div className="relative w-full">
         {/* Area di input con bordo arrotondato, evidenziazione gialla al focus */}
         <div className="border-2 border-gray-200 rounded-[2.5rem] p-6 md:p-8 min-h-[350px] flex flex-col relative bg-white transition hover:border-yellow-400 focus-within:border-yellow-400 group">
            
            {/* Placeholder visuale "TESTO" mostrato quando sia il testo che i file sono vuoti */}
            {!textValue && files.length === 0 && (
                <span className="absolute top-1/3 left-1/2 -translate-x-1/2 text-gray-400 font-bold tracking-widest uppercase pointer-events-none">
                    TESTO
                </span>
            )}

            {/* Textarea per la descrizione dell'attività */}
            <textarea 
              className="w-full flex-1 outline-none text-black bg-transparent resize-none text-lg z-10 placeholder-transparent"
              placeholder="Scrivi qui..."
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
            />

            {/* Galleria di miniature delle immagini allegate */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4 z-20 mt-6 pt-4 border-t border-gray-100">
                  {/* Itera ogni immagine allegata e mostra una miniatura */}
                  {files.map((fileData, idx) => (
                    <div key={idx} className="relative group/image">
                        {/* Miniatura cliccabile: apre il modale a schermo intero */}
                        <img 
                          src={fileData} 
                          alt={`Allegato ${idx}`}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-yellow-300 shadow-sm cursor-pointer hover:opacity-90 transition"
                          onClick={() => setModalImage(fileData)}
                        />
                        {/* Pulsante X per rimuovere l'immagine, visibile al hover */}
                        <button 
                          onClick={() => onRemoveFile(fileData)} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover/image:opacity-100"
                        >
                            <XMarkIcon className="w-4 h-4"/>
                        </button>
                    </div>
                  ))}
                </div>
            )}

            {/* Barra strumenti in basso: pulsante per aggiungere immagini */}
            <div className="flex justify-center gap-12 items-center mt-2 px-4 text-gray-400 z-20">
                {/* Label cliccabile che attiva l'input file nascosto */}
                <label className="flex flex-col items-center gap-1 cursor-pointer hover:text-yellow-500 transition hover:scale-110">
                    {/* Icona foto */}
                    <PhotoIcon className="w-8 h-8" />
                    <span className="text-xs font-bold">Aggiungi Immagine</span>
                    {/* Input file nascosto: accetta solo immagini */}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onAddFile(e.target.files)} />
                </label>
            </div>
         </div>
      </div>
    </>
  );
}