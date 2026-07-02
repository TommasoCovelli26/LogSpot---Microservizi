/**
 * Componente textarea per inserire l'obiettivo terapeutico dell'attività.
 * Mostra un campo di testo multi-riga con etichetta e stile personalizzato.
 * @param value - Il valore attuale dell'obiettivo
 * @param onChange - Callback invocata quando il testo cambia
 */
export default function CreateObjective({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    // Container principale con padding superiore
    <div className="w-full pt-4">
        {/* Etichetta della sezione */}
        <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">OBBIETTIVO TERAPEUTICO</label>
        {/* Textarea per l'inserimento dell'obiettivo terapeutico */}
        <textarea 
            className="w-full p-4 border border-gray-200 rounded-2xl focus:border-yellow-400 outline-none text-black h-32 resize-none shadow-sm transition"
            placeholder="Scrivi l'obiettivo..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
  );
}