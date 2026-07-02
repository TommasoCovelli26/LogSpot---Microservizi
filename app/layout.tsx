// Importa il tipo Metadata da Next.js per definire i metadati della pagina (titolo, descrizione, ecc.)
import type { Metadata } from "next";
// Importa i font Geist Sans e Geist Mono da Google Fonts tramite il modulo next/font
import { Geist, Geist_Mono } from "next/font/google";
// Importa il foglio di stile globale dell'applicazione
import "./globals.css";

// Inizializza il font Geist Sans con una variabile CSS personalizzata e il sottoinsieme di caratteri latini
const geistSans = Geist({
  variable: "--font-geist-sans", // Nome della variabile CSS che conterrà questo font
  subsets: ["latin"], // Carica solo i caratteri dell'alfabeto latino per ottimizzare le prestazioni
});

// Inizializza il font Geist Mono (monospace) con una variabile CSS personalizzata e il sottoinsieme latino
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // Nome della variabile CSS che conterrà questo font monospace
  subsets: ["latin"], // Carica solo i caratteri dell'alfabeto latino
});

// Esporta i metadati della pagina, utilizzati da Next.js per generare i tag <head> (titolo e descrizione SEO)
export const metadata: Metadata = {
  title: "LogSpot", // Titolo dell'applicazione visualizzato nella scheda del browser
  description: "Piattaforma per la logopedia italiana", // Descrizione SEO dell'applicazione
};

// Componente RootLayout: layout radice che avvolge tutte le pagine dell'applicazione Next.js
export default function RootLayout({
  children, // Proprietà children: contiene il contenuto della pagina corrente renderizzata da Next.js
}: Readonly<{
  children: React.ReactNode; // Tipo TypeScript: accetta qualsiasi nodo React valido come figlio
}>) {
  return (
    // Elemento HTML radice con attributo lang impostato su "en" (inglese)
    <html lang="en">
      {/* Elemento body con le classi CSS dei font Geist e la classe antialiased per un rendering del testo più nitido */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Renderizza il contenuto della pagina corrente passato come children */}
        {children}
      </body>
    </html>
  );
}
