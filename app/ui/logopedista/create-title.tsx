/**
 * Componente input per il titolo dell'attività in fase di creazione.
 * Mostra un campo di testo con etichetta "TITOLO" e bordo inferiore
 * che diventa giallo al focus.
 * @param value - Il valore attuale del titolo
 * @param onChange - Callback invocata quando il testo cambia
 */
export default function CreateTitle({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    // Container con effetto group per animazioni hover
    <div className="group w-full">
      {/* Etichetta grande "TITOLO" */}
      <label className="block text-2xl font-bold text-gray-400 mb-2 uppercase">TITOLO</label>
      {/* Input di testo con bordo inferiore, diventa giallo al focus */}
      <input 
        type="text" 
        placeholder="Inserisci titolo..." 
        className="w-full text-xl font-medium text-black border-b border-gray-300 focus:border-yellow-400 outline-none py-2 bg-transparent transition placeholder-gray-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}