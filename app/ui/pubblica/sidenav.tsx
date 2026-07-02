// Direttiva per indicare che questo è un componente client-side
"use client";

// Importazione degli hook React per stato e effetti collaterali
import { useEffect, useState } from 'react';
// Importazione del componente Link per la navigazione interna
import Link from 'next/link';
// Importazione del componente NavLinks dalla stessa cartella
import NavLinks from './nav-links';
// Importazione del font Lusitana per il logo
import { lusitana } from '../fonts';

/**
 * Componente sidebar principale dell'applicazione.
 * Mostra il logo LogSpot (colore diverso per ruolo), i link di navigazione e il footer.
 * Il colore del logo cambia: giallo per logopedista, blu per paziente/visitatore.
 */
export default function SideNav() {
  // Stato per i dati dell'utente corrente
  const [utente, setUtente] = useState<any>(null);
  // Determina se l'utente è un logopedista
  const isLogopedista = utente?.ruolo === "logopedista";
  // Link del logo: dashboard se loggato, homepage se visitatore
  const logoHref = utente ? "/dashboard" : "/";

  // Effetto per caricare i dati utente dal localStorage all'avvio
  useEffect(() => {
    // Legge la stringa JSON dell'utente dal localStorage
    const u = localStorage.getItem("utente");
    // Se presente, parsifica e salva nello stato
    if (u) setUtente(JSON.parse(u));
  }, []);

  return (
    // Container verticale della sidebar con padding
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      {/* Logo LogSpot con link e sfondo colorato in base al ruolo */}
      <Link
        className={`mb-2 flex h-20 items-end justify-start rounded-md p-4 md:h-40 ${
          isLogopedista ? "bg-yellow-500" : "bg-blue-800" // Giallo per logopedista, blu per paziente
        }`}
        href={logoHref}
      >
        {/* Testo del logo con font Lusitana */}
        <div className={`w-32 text-white md:w-40 ${lusitana.className} text-2xl font-bold`}>
          LogSpot
        </div>
      </Link>
      {/* Container dei link di navigazione e footer */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {/* Componente con i link di navigazione */}
        <NavLinks />
        {/* Spaziatore che riempie lo spazio verticale disponibile (visibile solo su desktop) */}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        {/* Footer con copyright */}
        <div className="flex h-[48px] w-full items-center justify-center rounded-md bg-gray-100 p-3 text-xs font-light text-gray-500 md:justify-start">
          <p className="hidden md:block">LogSpot © 2026</p>
        </div>
      </div>
    </div>
  );
} 