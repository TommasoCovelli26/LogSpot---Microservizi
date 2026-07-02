// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione degli hook di Next.js per gestire parametri URL e navigazione
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

/**
 * Componente filtro per fascia d'età nella pagina di ricerca materiali.
 * Utilizza un range slider che aggiorna i parametri URL per sincronizzare il filtro.
 */
export default function FiltersAge() {
  // Ottiene i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Ottiene il pathname corrente
  const pathname = usePathname();
  // Destruttura la funzione replace dal router per navigazione senza history
  const { replace } = useRouter();

  // Legge il valore attuale dell'età dai parametri URL (default 0)
  const currentAge = parseInt(searchParams.get('age') || '0');
  // Età massima consentita dal filtro
  const maxAge = 123;

  /**
   * Gestisce il cambiamento dello slider dell'età.
   * Aggiorna l'URL con il nuovo parametro 'age'.
   * @param age - Nuovo valore dell'età selezionata
   */
  const handleAgeChange = (age: number) => {
    // Crea una copia dei parametri URL correnti
    const params = new URLSearchParams(searchParams);
    if (age > 0) {
      // Se l'età è maggiore di 0, imposta il parametro
      params.set('age', age.toString());
    } else {
      // Se l'età è 0, rimuove il parametro (nessun filtro)
      params.delete('age');
    }
    // Naviga all'URL aggiornato senza aggiungere alla history
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    // Container del filtro età con padding e margine
    <div className="w-full pt-2 mb-6">
      {/* Etichetta con indicazione dell'età selezionata (se > 0) */}
      <label className="block text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider">
        FASCIA D'ETÀ {currentAge > 0 && `(${currentAge} anni)`}
      </label>

      {/* Container dello slider con posizionamento relativo */}
      <div className="relative w-full h-12 flex items-center">
        {/* Etichetta minima (0) posizionata a sinistra sotto lo slider */}
        <span className="absolute left-0 -bottom-6 text-xs font-bold text-gray-400">0</span>
        {/* Etichetta massima posizionata a destra sotto lo slider */}
        <span className="absolute right-0 -bottom-6 text-xs font-bold text-gray-400">{maxAge}</span>

        {/* Input range slider con gradiente giallo per la parte selezionata */}
        <input
          type="range"
          min="0"
          max={maxAge}
          value={currentAge}
          onChange={(e) => handleAgeChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-10"
          title="Seleziona la fascia d'età"
          style={{
            // Gradiente lineare: giallo fino al valore corrente, grigio dopo
            background: `linear-gradient(to right, #e1ff00 0%, #e1ff00 ${(currentAge / maxAge) * 100}%, #e5e7eb ${(currentAge / maxAge) * 100}%, #e5e7eb 100%)`
          }}>
        </input>

        {/* Indicatore circolare giallo che mostra il valore corrente sopra lo slider */}
        {currentAge > 0 && (
          <div
            className="absolute top-0 w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xs shadow-md pointer-events-none transition-all duration-75 z-20"
            style={{
              // Posiziona l'indicatore in base alla percentuale del valore
              left: `calc(${(currentAge / maxAge) * 100}% - 16px)`,
              top: '-10px'
            }}
          >
            {/* Valore numerico dell'età selezionata */}
            {currentAge}
          </div>
        )}

        {/* CSS personalizzato per nascondere il thumb nativo dello slider */}
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            background: transparent;
            cursor: pointer;
          }
          input[type='range']::-moz-range-thumb {
            height: 24px;
            width: 24px;
            background: transparent;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>
    </div>
  );
}
