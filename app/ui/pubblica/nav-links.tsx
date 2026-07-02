// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione delle icone Heroicons usate nei link di navigazione
import {
  HomeIcon,                       // Icona homepage
  InformationCircleIcon,          // Icona chi siamo
  UserCircleIcon,                 // Icona profilo/accedi
  RectangleStackIcon,             // Icona dashboard
  ClipboardDocumentListIcon,      // Icona materiali/esercizi
  UserGroupIcon,                  // Icona pazienti
  ArrowRightOnRectangleIcon,      // Icona logout
  MagnifyingGlassIcon,            // Icona ricerca materiali
  ChartBarIcon,                   // Icona progressi
} from '@heroicons/react/24/outline';
// Importazione del componente Link per la navigazione interna
import Link from 'next/link';
// Importazione degli hook per pathname, router, stato e effetti
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// Importazione di clsx per la composizione condizionale delle classi
import clsx from 'clsx';

/**
 * Componente link di navigazione della sidebar.
 * Mostra link diversi in base al ruolo dell'utente (pubblico, logopedista, paziente).
 * Include pulsante di logout con conferma e chiamata API.
 */
export default function NavLinks() {
  // Ottiene il percorso corrente per evidenziare il link attivo
  const pathname = usePathname();
  // Ottiene il router per la navigazione programmatica
  const router = useRouter();
  // Stato per i dati dell'utente corrente (null se non loggato)
  const [utente, setUtente] = useState<any>(null);
  // Determina se l'utente è un logopedista per lo stile dei link
  const isLogopedista = utente?.ruolo === "logopedista";

  // Effetto per caricare i dati utente dal localStorage all'avvio
  useEffect(() => {
    // Legge la stringa JSON dell'utente dal localStorage
    const u = localStorage.getItem("utente");
    // Se presente, parsifica e salva nello stato
    if (u) setUtente(JSON.parse(u));
  }, []);

  /**
   * Funzione di logout: chiede conferma, rimuove i dati dal localStorage,
   * chiama l'API di logout e reindirizza alla homepage.
   */
  const logout = async () => {
    // Mostra un dialog di conferma all'utente
    const conferma = window.confirm("Sei sicuro di voler effettuare il logout?");
    // Se l'utente annulla, esce dalla funzione
    if (!conferma) return;
    
    // Rimuove i dati utente dal localStorage
    localStorage.removeItem("utente");
    
    try {
      // Chiama l'API server per invalidare la sessione lato server
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      // Logga eventuali errori durante il logout server
      console.error("Errore durante il logout server:", error);
    }
    
    // Resetta lo stato utente a null
    setUtente(null);
    // Reindirizza alla homepage
    router.push("/");
  };

  /**
   * Genera le classi CSS per un link di navigazione.
   * Applica stili diversi in base al ruolo (giallo per logopedista, blu per paziente)
   * e allo stato attivo del link.
   * @param href - Percorso del link per determinare se è attivo
   * @returns Stringa di classi CSS
   */
  const linkClass = (href: string) =>
    clsx(
      // Classi base comuni a tutti i link
      'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3',
      // Stile hover in base al ruolo: giallo per logopedista, azzurro per paziente
      isLogopedista
        ? 'hover:bg-yellow-100 hover:text-yellow-700'
        : 'hover:bg-sky-100 hover:text-blue-600',
      // Stile attivo in base al ruolo e al percorso corrente
      isLogopedista
        ? { 'bg-yellow-100 text-yellow-700': pathname === href }
        : { 'bg-sky-100 text-blue-600': pathname === href }
    );

  // Array dei link pubblici visibili a tutti i visitatori non loggati
  const linksPubblici = [
    { name: 'Homepage', href: '/', icon: HomeIcon },
    { name: 'Chi Siamo', href: '/chi-siamo', icon: InformationCircleIcon },
  ];

  // Link "Chi Siamo" riutilizzato in più array
  const linkChiSiamo = {
    name: 'Chi Siamo',
    href: '/chi-siamo',
    icon: InformationCircleIcon,
  };

  // Array dei link per il ruolo logopedista
  const linksLogopedista = [
    { name: 'Dashboard', href: '/dashboard', icon: RectangleStackIcon },
    { name: 'Pazienti', href: '/logopedista/lista-pazienti', icon: UserGroupIcon },
    { name: 'I miei materiali', href: '/logopedista/imieimateriali', icon: ClipboardDocumentListIcon },
    { name: 'Ricerca materiali', href: '/logopedista/ricerca-materiali', icon: MagnifyingGlassIcon },
    linkChiSiamo, // Include il link Chi Siamo condiviso
    { name: 'Profilo', href: '/profilo', icon: UserCircleIcon },
  ];

  // Array dei link per il ruolo paziente
  const linksPaziente = [
    { name: 'Dashboard', href: '/dashboard', icon: RectangleStackIcon },
    { name: 'I miei esercizi', href: '/paziente/esercizi', icon: ClipboardDocumentListIcon },
    { name: 'I miei Progressi', href: '/paziente/progressi', icon: ChartBarIcon },
    linkChiSiamo, // Include il link Chi Siamo condiviso
    { name: 'Profilo', href: '/profilo', icon: UserCircleIcon },
  ];

  return (
    <>
      {/* Sezione link pubblici: visibile solo se l'utente non è loggato */}
      {!utente &&
        linksPubblici.map((link) => {
        // Estrae il componente icona dal link
        const Icon = link.icon;
        return (
          // Link con icona e testo (testo visibile solo su desktop)
          <Link key={link.name} href={link.href} className={linkClass(link.href)}>
            <Icon className="w-6" />
            <span className="hidden md:block">{link.name}</span>
          </Link>
        );
      })}

      {/* Link "Accedi": visibile solo se l'utente non è loggato */}
      {!utente && (
        <Link href="/login" className={linkClass("/login")}>
          <UserCircleIcon className="w-6" />
          <span className="hidden md:block">Accedi</span>
        </Link>
      )}

      {/* Sezione link logopedista: visibile solo per utenti con ruolo logopedista */}
      {utente?.ruolo === "logopedista" &&
        linksLogopedista.map((link) => {
          // Estrae il componente icona dal link
          const Icon = link.icon;
          return (
            // Link con icona e testo (testo visibile solo su desktop)
            <Link key={link.name} href={link.href} className={linkClass(link.href)}>
              <Icon className="w-6" />
              <span className="hidden md:block">{link.name}</span>
            </Link>
          );
        })}

      {/* Sezione link paziente: visibile solo per utenti con ruolo paziente */}
      {utente?.ruolo === "paziente" &&
        linksPaziente.map((link) => {
          // Estrae il componente icona dal link
          const Icon = link.icon;
          return (
            // Link con icona e testo (testo visibile solo su desktop)
            <Link key={link.name} href={link.href} className={linkClass(link.href)}>
              <Icon className="w-6" />
              <span className="hidden md:block">{link.name}</span>
            </Link>
          );
        })}

      {/* Pulsante logout: visibile solo se l'utente è loggato */}
      {utente && (
        <button
          onClick={logout} // Esegue la procedura di logout con conferma
          className="flex h-[48px] items-center gap-2 rounded-md p-3 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          <ArrowRightOnRectangleIcon className="w-6" />
          <span className="hidden md:block">Logout</span>
        </button>
      )}
    </>
  );
}
