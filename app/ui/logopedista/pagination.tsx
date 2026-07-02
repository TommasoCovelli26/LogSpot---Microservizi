// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione delle icone freccia sinistra e destra
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
// Importazione della libreria per classi CSS condizionali
import clsx from 'clsx';
// Importazione del componente Link di Next.js per la navigazione
import Link from 'next/link';
// Importazione della funzione helper per generare i numeri di pagina
import { generatePagination } from '@/app/lib/utils';
// Importazione degli hook di Next.js per pathname e parametri URL
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Componente di paginazione che mostra i numeri di pagina e le frecce di navigazione.
 * Genera l'URL della pagina aggiornando il parametro 'page' nei search params.
 * @param totalPages - Numero totale di pagine disponibili
 */
export default function Pagination({ totalPages }: { totalPages: number }) {
  // Ottiene il pathname corrente
  const pathname = usePathname();
  // Ottiene i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Pagina corrente letta dall'URL (default: 1)
  const currentPage = Number(searchParams.get('page')) || 1;

  /**
   * Crea l'URL per una specifica pagina mantenendo gli altri parametri.
   * @param pageNumber - Numero della pagina di destinazione
   * @returns URL con il parametro 'page' aggiornato
   */
  const createPageURL = (pageNumber: number | string) => {
    // Crea una copia dei parametri URL correnti
    const params = new URLSearchParams(searchParams);
    // Imposta il parametro 'page' con il nuovo numero
    params.set('page', pageNumber.toString());
    // Restituisce l'URL completo
    return `${pathname}?${params.toString()}`;
  };

  // Genera l'array dei numeri di pagina da mostrare (con eventuali '...')
  const allPages = generatePagination(currentPage, totalPages);

  return (
    <>
      {/* Container inline-flex per allineare freccia-numeri-freccia */}
       <div className="inline-flex">
        {/* Freccia di navigazione sinistra (pagina precedente) */}
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        {/* Numeri di pagina con overlap negativo dei bordi */}
        <div className="flex -space-x-px">
          {allPages.map((page, index) => {
            // Determina la posizione del numero per lo stile dei bordi arrotondati
            let position: 'first' | 'last' | 'single' | 'middle' | undefined;

            // Primo elemento: bordi arrotondati a sinistra
            if (index === 0) position = 'first';
            // Ultimo elemento: bordi arrotondati a destra
            if (index === allPages.length - 1) position = 'last';
            // Elemento singolo: bordi arrotondati su entrambi i lati
            if (allPages.length === 1) position = 'single';
            // Elemento '...': stile speciale per ellissi
            if (page === '...') position = 'middle';

            return (
              // Componente numero di pagina cliccabile
              <PaginationNumber
                key={`${page}-${index}`}
                href={createPageURL(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>

        {/* Freccia di navigazione destra (pagina successiva) */}
        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </>
  );
}

/**
 * Componente interno per un singolo numero di pagina.
 * Renderizza un Link cliccabile o un div statico (se attivo o ellissi).
 * @param page - Numero della pagina o '...'
 * @param href - URL di destinazione
 * @param isActive - Se questa è la pagina corrente
 * @param position - Posizione nell'elenco per lo stile dei bordi
 */
function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
}) {
  // Costruisce le classi CSS in base alla posizione e allo stato attivo
  const className = clsx(
    'flex h-10 w-10 items-center justify-center text-sm border',
    {
      // Bordi arrotondati a sinistra per primo o singolo
      'rounded-l-md': position === 'first' || position === 'single',
      // Bordi arrotondati a destra per ultimo o singolo
      'rounded-r-md': position === 'last' || position === 'single',
      // Sfondo blu per la pagina attiva
      'z-10 bg-blue-600 border-blue-600 text-white': isActive,
      // Hover grigio per le pagine non attive e non ellissi
      'hover:bg-gray-100': !isActive && position !== 'middle',
      // Testo grigio chiaro per le ellissi
      'text-gray-300': position === 'middle',
    },
  );

  // Se è attivo o è un'ellissi, renderizza un div statico, altrimenti un Link
  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

/**
 * Componente interno per le frecce di navigazione (precedente/successivo).
 * Renderizza un Link o un div disabilitato in base allo stato.
 * @param href - URL di destinazione
 * @param direction - Direzione della freccia ('left' o 'right')
 * @param isDisabled - Se la freccia è disabilitata (prima/ultima pagina)
 */
function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  // Costruisce le classi CSS in base alla direzione e allo stato disabilitato
  const className = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border',
    {
      // Stile disabilitato: puntatore bloccato e testo grigio
      'pointer-events-none text-gray-300': isDisabled,
      // Hover grigio per frecce attive
      'hover:bg-gray-100': !isDisabled,
      // Margine a destra per la freccia sinistra
      'mr-2 md:mr-4': direction === 'left',
      // Margine a sinistra per la freccia destra
      'ml-2 md:ml-4': direction === 'right',
    },
  );

  // Sceglie l'icona in base alla direzione
  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className="w-4" />
    ) : (
      <ArrowRightIcon className="w-4" />
    );

  // Se disabilitato, renderizza un div statico, altrimenti un Link cliccabile
  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}
