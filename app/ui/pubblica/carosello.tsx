// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione degli hook React per stato e effetti collaterali
import { useState, useEffect } from 'react';
// Importazione del componente Image di Next.js per immagini ottimizzate
import Image from 'next/image';
// Importazione del font Lusitana per i testi decorativi
import { lusitana } from '../fonts';
// Importazione di clsx per la composizione condizionale delle classi CSS
import clsx from 'clsx';

/**
 * Array delle slide del carosello.
 * Ogni slide ha un testo opzionale e un percorso all'immagine.
 */
const slides = [
  {
    text: "Spazio unico per la raccolta di documenti logopedici", // Testo prima slide
    src: "/logopedista.jpg", // Immagine logopedista
  },
  {
    text: "Hub dove poter visualizzare tutte le attività dettagliate", // Testo seconda slide
    src: "/paziente.jpg", // Immagine paziente
  },
  {
    text: "", // Terza slide senza testo
    src: "/paziente1.jpg", // Seconda immagine paziente
  },
];

/**
 * Componente carosello con auto-play e transizioni fade per la homepage pubblica.
 * Mostra slide con immagini e testo opzionale, con indicatori a pallino e frecce di navigazione.
 */
export default function Carousel() {
  // Stato per l'indice della slide corrente
  const [current, setCurrent] = useState(0);

  // Effetto per l'auto-play: cambia slide automaticamente ogni 5 secondi
  useEffect(() => {
    // Imposta un intervallo che avanza alla slide successiva
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    // Pulisce l'intervallo quando il componente viene smontato
    return () => clearInterval(timer);
  }, []);

  return (
    // Container del carosello con altezza responsive e angoli arrotondati
    <div className="relative w-full h-[200px] md:h-[400px] overflow-hidden rounded-xl shadow-lg">
      {/* Mappa ogni slide con transizione di opacità */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={clsx(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out", // Transizione opacità di 1 secondo
            {
              "opacity-100 z-10": index === current, // Slide attiva: visibile e in primo piano
              "opacity-0 z-0": index !== current,    // Slide inattiva: nascosta
            }
          )}
        >
          {/* Overlay scuro con testo, mostrato solo se la slide ha testo */}
          {slide.text && (
            <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center p-8">
              {/* Testo della slide con font Lusitana */}
              <h2 className={`${lusitana.className} text-white text-center text-2xl md:text-4xl font-bold max-w-2xl`}>
                {slide.text}
              </h2>
            </div>
          )}
          
          {/* Immagine della slide che copre l'intero container */}
          <img
            src={slide.src}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Indicatori a pallino per la navigazione tra slide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)} // Naviga alla slide cliccata
            className={clsx(
              "w-3 h-3 rounded-full transition-colors",
              i === current ? "bg-white" : "bg-white/50" // Pallino attivo bianco pieno, inattivo semitrasparente
            )}
          />
        ))}
      </div>

      {/* Pulsante freccia sinistra per la slide precedente */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center z-30 transition-colors"
        aria-label="Precedente"
      >
        &#10094;
      </button>

      {/* Pulsante freccia destra per la slide successiva */}
      <button
        onClick={() => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center z-30 transition-colors"
        aria-label="Successivo"
      >
        &#10095;
      </button>
    </div>
  );
}