/**
 * Componente slider per selezionare la fascia d'età target dell'attività.
 * Mostra un range input personalizzato con un indicatore circolare giallo
 * che mostra il valore corrente.
 * @param value - Il valore attuale dell'età selezionata
 * @param onChange - Callback invocata quando l'utente cambia il valore
 */
export default function CreateAge({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  // Età massima consentita nello slider
  const maxAge = 123;
  
  return (
    // Container principale con padding superiore
    <div className="w-full pt-2">
        {/* Etichetta della sezione */}
        <label className="block text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider">FASCIA D'ETÀ</label>
        
        {/* Container relativo per posizionare l'indicatore e le etichette */}
        <div className="relative w-full h-12 flex items-center">
            {/* Etichetta valore minimo (0) posizionata in basso a sinistra */}
            <span className="absolute left-0 -bottom-6 text-xs font-bold text-gray-400">0</span>
            {/* Etichetta valore massimo posizionata in basso a destra */}
            <span className="absolute right-0 -bottom-6 text-xs font-bold text-gray-400">{maxAge}</span>

            {/* Input range personalizzato con gradiente giallo per la parte selezionata */}
            <input 
                type="range" 
                min="0" 
                max={maxAge} 
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-10"
                style={{
                    // Gradiente che colora la parte selezionata in giallo e il resto in grigio
                    background: `linear-gradient(to right, #FACC15 0%, #FACC15 ${(value / maxAge) * 100}%, #e5e7eb ${(value / maxAge) * 100}%, #e5e7eb 100%)`
                }}
            />

            {/* Indicatore circolare giallo che segue la posizione dello slider */}
            <div 
                className="absolute top-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-xs shadow-md pointer-events-none transition-all duration-75 z-20"
                style={{ 
                    // Posizione orizzontale calcolata in base al valore corrente
                    left: `calc(${((value / maxAge) * 100)}% - 16px)`,
                    top: '-10px'
                }}
            >
                {/* Mostra il valore numerico corrente dentro il cerchio */}
                {value}
            </div>
            
            {/* CSS personalizzato per nascondere il thumb nativo del range input */}
            <style jsx>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 24px;
                    width: 24px;
                    background: transparent;
                    cursor: pointer;
                }
                input[type=range]::-moz-range-thumb {
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