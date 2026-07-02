/**
 * Componente pulsante per salvare l'attività creata.
 * Mostra testo diverso durante il salvataggio e si disabilita.
 * @param onSave - Callback invocata al click per avviare il salvataggio
 * @param isSaving - Se true, il pulsante è disabilitato e mostra "Salvataggio in corso..."
 */
export default function CreateSaveButton({ onSave, isSaving }: { onSave: () => void, isSaving: boolean }) {
  return (
    // Container centrato con padding verticale ampio
    <div className="w-full pt-8 pb-12 flex justify-center">
        {/* Pulsante giallo grande, disabilitato durante il salvataggio */}
        <button 
            onClick={onSave}
            disabled={isSaving}
            className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-12 py-4 rounded-2xl font-bold shadow-lg transition disabled:opacity-50 uppercase tracking-widest transform hover:scale-105"
        >
            {/* Testo dinamico: cambia durante il salvataggio */}
            {isSaving ? 'Salvataggio in corso...' : 'SALVA ATTIVITÀ'}
        </button>
    </div>
  );
}