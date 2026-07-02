// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione degli hook React per stato e effetti collaterali
import { useState, useEffect } from 'react';
// Importazione dell'hook useRouter di Next.js per la navigazione programmatica
import { useRouter } from 'next/navigation';
// Importazione della Server Action per aggiornare un'attività
import { updateActivity } from '../../lib/actions';
// Importazione del tipo ActivityDetail per la tipizzazione
import { ActivityDetail } from '../../lib/activities';

// Importazione dei componenti UI per il form di modifica
import CreateHeader from './create-header';
import CreateTitle from './create-title';
import CreateDescription from './create-description';
import CreateAge from './create-age';
import CreatePathology from './create-pathology';
import CreateObjective from './create-objective';
import CreateAccessibility from './create-accessibility';

/**
 * Componente form per la modifica di un'attività esistente.
 * Gestisce il dirty checking, la protezione da chiusura accidentale
 * e l'aggiornamento tramite Server Action.
 * @param activity - L'attività da modificare con i suoi dati attuali
 */
export default function EditForm({ activity }: { activity: ActivityDetail }) {
  // Hook per la navigazione programmatica
  const router = useRouter();
  // Stato che indica se il salvataggio è in corso
  const [isSaving, setIsSaving] = useState(false);

  // Inizializzazione dello stato del form con i dati provenienti dal database
  const [formState, setFormState] = useState({
    titolo: activity.titolo,
    descrizioneTesto: activity.descrizione || '',
    // Converte la stringa di immagini separate da '|' in un array
    allegati: activity.immagine ? activity.immagine.split('|').filter(Boolean) : [],
    obbiettivo: activity.istruzioni || '',
    fasciaEta: activity.fasciaEta,
    // Converte la stringa di patologie separate da ',' in un array
    patologie: activity.patologie ? activity.patologie.split(',').filter(Boolean) : [],
    accessibilita: activity.accessibilita
  });

  // --- 1. CALCOLO MODIFICHE (DIRTY CHECK) ---
  // Confrontiamo i valori attuali del form con quelli originali del database
  // isDirty è true se almeno un campo è stato modificato
  const isDirty = 
    formState.titolo !== activity.titolo ||
    formState.descrizioneTesto !== (activity.descrizione || '') ||
    formState.obbiettivo !== (activity.istruzioni || '') ||
    formState.fasciaEta !== activity.fasciaEta ||
    formState.accessibilita !== activity.accessibilita ||
    formState.allegati.join('|') !== (activity.immagine || '') ||
    formState.patologie.join(',') !== (activity.patologie || '');

  // --- 2. PROTEZIONE CHIUSURA BROWSER ---
  // Intercetta la chiusura del browser se ci sono modifiche non salvate
  useEffect(() => {
    // Handler per l'evento beforeunload del browser
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Se ci sono modifiche non salvate e non si sta salvando
      if (isDirty && !isSaving) {
        // Previene la chiusura e mostra il popup nativo del browser
        e.preventDefault();
        e.returnValue = ''; // Standard browser per mostrare il popup
      }
    };
    // Registra l'event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Rimuove l'event listener al cleanup
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSaving]);

  // --- 3. GESTIONE TASTO INDIETRO ---
  /**
   * Gestisce il click sul pulsante "Indietro".
   * Se ci sono modifiche non salvate, mostra un dialog di conferma.
   */
  const handleBack = () => {
    // Se ci sono modifiche, chiede conferma all'utente
    if (isDirty) {
      const confirmLeave = window.confirm("Hai modificato l'attività ma non hai salvato. Se torni indietro, le modifiche andranno perse. Sei sicuro?");
      // Se l'utente annulla, non torna indietro
      if (!confirmLeave) return;
    }
    // Se non ci sono modifiche o l'utente ha confermato, torniamo indietro
    router.back();
  };

  /**
   * Aggiorna un singolo campo dello stato del form.
   * @param field - Nome del campo da aggiornare
   * @param value - Nuovo valore del campo
   */
  const handleInputChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Gestisce l'aggiunta di un file immagine come allegato.
   * Converte il file in base64 e lo aggiunge all'array degli allegati.
   * @param files - Lista dei file selezionati dall'utente
   */
  const handleAddFile = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      // Controllo di sicurezza basilare: verifica che sia un'immagine
      if (!file.type.startsWith('image/')) {
        alert("Per favore carica solo file immagine.");
        return;
      }

      // Crea un FileReader per leggere il file
      const reader = new FileReader();
      
      // Callback eseguita quando la lettura è completata
      reader.onloadend = () => {
        // reader.result contiene la stringa base64 dell'immagine
        const base64String = reader.result as string;

        // Evitiamo duplicati esatti controllando se l'immagine è già presente
        if (!formState.allegati.includes(base64String)) {
          // Aggiunge l'immagine all'array degli allegati
          setFormState(prev => ({
            ...prev,
            allegati: [...prev.allegati, base64String]
          }));
        }
      };

      // Avvia la lettura del file come Data URL (base64)
      reader.readAsDataURL(file);
    }
  };

  /**
   * Rimuove un allegato dall'array delle immagini.
   * @param fileData - Stringa base64 dell'immagine da rimuovere
   */
  const removeFile = (fileData: string) => {
    // Filtra l'array rimuovendo l'immagine specificata
    setFormState(prev => ({
      ...prev,
      allegati: prev.allegati.filter(f => f !== fileData)
    }));
  };

  /**
   * Aggiunge o rimuove una patologia dalla selezione.
   * @param pat - Nome della patologia da toggle
   */
  const togglePatologia = (pat: string) => {
    // Ottiene l'array corrente delle patologie selezionate
    const current = formState.patologie;
    // Se è già selezionata la rimuove, altrimenti la aggiunge
    const newPatologie = current.includes(pat) 
      ? current.filter(p => p !== pat) 
      : [...current, pat];
    // Aggiorna lo stato del form
    handleInputChange('patologie', newPatologie);
  };

  /**
   * Gestisce la sottomissione del form di aggiornamento.
   * Valida il titolo, prepara i dati e invoca la Server Action.
   */
  const handleUpdate = async () => {
    // Validazione: il titolo è obbligatorio
    if (!formState.titolo) return alert("Inserisci almeno il titolo.");
    // Imposta lo stato di salvataggio
    setIsSaving(true);
    // Prepara i dati da inviare al server, unendo allegati con '|'
    const dataToSave = {
      ...formState,
      descrizione: formState.descrizioneTesto, 
      immagine: formState.allegati.join('|') 
    };

    // Invoca la Server Action per aggiornare l'attività nel database
    const res = await updateActivity(activity.cod, dataToSave);
    
    if (res.success) {
      // Se l'aggiornamento è riuscito, reindirizza alla pagina di dettaglio
      router.push(`/logopedista/imieimateriali/${activity.cod}`);
    } else {
      // Se l'aggiornamento è fallito, mostra l'errore e ripristina lo stato
      setIsSaving(false);
      alert("Errore: " + res.message);
    }
  };

  return (
    // Container principale del form con gap tra le sezioni
    <div className="flex flex-col gap-8">
      {/* Header con pulsante indietro personalizzato con protezione dirty */}
      <CreateHeader onBack={handleBack} />

      {/* Campo titolo dell'attività */}
      <CreateTitle 
        value={formState.titolo} 
        onChange={(val) => handleInputChange('titolo', val)} 
      />

      {/* Campo descrizione con gestione allegati immagine */}
      <CreateDescription 
        textValue={formState.descrizioneTesto}
        onTextChange={(val) => handleInputChange('descrizioneTesto', val)}
        files={formState.allegati}
        onAddFile={handleAddFile}
        onRemoveFile={removeFile}
      />

      {/* Selettore fascia d'età con slider */}
      <CreateAge 
        value={formState.fasciaEta}
        onChange={(val) => handleInputChange('fasciaEta', val)}
      />

      {/* Selettore patologie con ricerca e toggle */}
      <CreatePathology 
        selected={formState.patologie}
        onToggle={togglePatologia}
      />

      {/* Campo obiettivo terapeutico */}
      <CreateObjective 
        value={formState.obbiettivo}
        onChange={(val) => handleInputChange('obbiettivo', val)}
      />

      {/* Toggle accessibilità (pubblica/privata) */}
      <CreateAccessibility 
        isPublic={formState.accessibilita}
        onChange={(val) => handleInputChange('accessibilita', val)}
      />

      {/* Sezione pulsante di aggiornamento centrato */}
      <div className="w-full pt-8 pb-12 flex justify-center">
          {/* Pulsante di aggiornamento con stile giallo e animazione hover */}
          <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-12 py-4 rounded-2xl font-bold shadow-lg transition disabled:opacity-50 uppercase tracking-widest transform hover:scale-105"
          >
              {/* Testo dinamico in base allo stato di salvataggio */}
              {isSaving ? 'Aggiornamento...' : 'AGGIORNA ATTIVITÀ'}
          </button>
      </div>
    </div>
  );
}