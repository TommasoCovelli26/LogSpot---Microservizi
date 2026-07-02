// Direttiva Next.js: indica che questo è un componente client-side (necessario per useState, useEffect, useRouter)
'use client';

// Importa gli hook useState e useEffect da React per gestire stato locale e side-effects
import { useState, useEffect } from 'react';
// Importa l'hook useRouter da Next.js per la navigazione programmatica
import { useRouter } from 'next/navigation';
// Importa la server action saveActivity per salvare l'attività nel database
import { saveActivity } from '../../lib/actions'; 

// Importa i componenti UI modulari per la pagina di creazione attività
import CreateHeader from '../../ui/logopedista/create-header';              // Header con pulsante indietro
import CreateTitle from '../../ui/logopedista/create-title';                // Campo titolo
import CreateDescription from '../../ui/logopedista/create-description';    // Area descrizione e allegati
import CreateAge from '../../ui/logopedista/create-age';                    // Selettore fascia d'età
import CreatePathology from '../../ui/logopedista/create-pathology';        // Selettore patologie
import CreateObjective from '../../ui/logopedista/create-objective';        // Campo obiettivo terapeutico
import CreateAccessibility from '../../ui/logopedista/create-accessibility';// Toggle accessibilità pubblica/privata
import CreateSaveButton from '../../ui/logopedista/create-save-button';    // Pulsante salvataggio

/**
 * Pagina di creazione di una nuova attività logopedica.
 * Presenta un form modulare con: titolo, descrizione con allegati immagine,
 * fascia d'età, patologie, obiettivo terapeutico e toggle accessibilità.
 * Include logica di protezione per modifiche non salvate (dirty check).
 * Corrisponde alla route '/logopedista/crea'.
 */
export default function CreaAttivitaPage() {
  // Hook per la navigazione programmatica (redirect dopo salvataggio)
  const router = useRouter();
  // Stato che indica se il salvataggio è in corso (per disabilitare il dirty check)
  const [isSaving, setIsSaving] = useState(false);

  // Stato completo del form di creazione attività con tutti i campi
  const [formState, setFormState] = useState({
    titolo: '',                    // Titolo dell'attività
    descrizioneTesto: '',          // Testo descrittivo dell'attività
    allegati: [] as string[],      // Array di immagini in formato Base64
    obbiettivo: '',                // Obiettivo terapeutico dell'attività
    fasciaEta: 0,                  // Fascia d'età target (numero)
    patologie: [] as string[],     // Array di patologie selezionate
    accessibilita: false           // Flag: true = pubblica, false = privata
  });

  // Calcola se il form ha modifiche non salvate (isDirty)
  // Controlla se almeno un campo è stato compilato rispetto ai valori iniziali
  const isDirty = 
    formState.titolo !== '' || 
    formState.descrizioneTesto !== '' || 
    formState.allegati.length > 0 ||
    formState.obbiettivo !== '' ||
    formState.patologie.length > 0;

  // Effect: aggiunge un listener sull'evento 'beforeunload' del browser
  // Mostra un avviso se l'utente cerca di chiudere/ricaricare la pagina con modifiche non salvate
  useEffect(() => {
    // Funzione handler per l'evento beforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Se ci sono modifiche non salvate e non si sta salvando, mostra l'avviso del browser
      if (isDirty && !isSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    // Registra il listener sull'evento beforeunload della finestra
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Cleanup: rimuove il listener quando il componente viene smontato o le dipendenze cambiano
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSaving]); // Riesegue se isDirty o isSaving cambiano

  /**
   * Gestisce il pulsante "Indietro": chiede conferma se ci sono modifiche non salvate,
   * poi naviga alla pagina dei materiali del logopedista.
   */
  const handleBack = () => {
    // Se il form ha modifiche non salvate, chiede conferma all'utente
    if (isDirty) {
      const confirmLeave = window.confirm("Hai delle modifiche non salvate. Se torni indietro, l'attività andrà persa. Sei sicuro?");
      // Se l'utente annulla, non fa nulla
      if (!confirmLeave) return;
    }
    // Naviga alla pagina "I miei materiali"
    router.push('/logopedista/imieimateriali');
  };

  /**
   * Gestisce il cambiamento di qualsiasi campo del form.
   * Aggiorna dinamicamente il campo specificato nello stato.
   * @param field - Nome del campo da aggiornare
   * @param value - Nuovo valore del campo
   */
  const handleInputChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Gestisce l'aggiunta di un file immagine come allegato.
   * Converte il file in formato Base64 per l'anteprima immediata nel browser
   * e lo aggiunge all'array degli allegati nello stato.
   * @param files - FileList dal selettore file HTML
   */
  const handleAddFile = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      // Controllo di sicurezza: verifica che il file sia un'immagine
      if (!file.type.startsWith('image/')) {
        alert("Per favore carica solo file immagine.");
        return;
      }

      // Crea un FileReader per leggere il file come stringa Base64
      const reader = new FileReader();
      
      // Callback eseguita quando la lettura del file è completata
      reader.onloadend = () => {
        // reader.result contiene la stringa Base64 dell'immagine (data:image/...;base64,...)
        const base64String = reader.result as string;

        // Evita duplicati: aggiunge solo se l'immagine non è già presente
        if (!formState.allegati.includes(base64String)) {
          setFormState(prev => ({
            ...prev,
            allegati: [...prev.allegati, base64String]
          }));
        }
      };

      // Avvia la lettura del file come Data URL (Base64)
      reader.readAsDataURL(file);
    }
  };

  /**
   * Rimuove un allegato dall'array degli allegati nello stato.
   * Confronta la stringa Base64 intera per identificare il file da rimuovere.
   * @param fileData - Stringa Base64 del file da rimuovere
   */
  const removeFile = (fileData: string) => {
    setFormState(prev => ({
      ...prev,
      allegati: prev.allegati.filter(f => f !== fileData)
    }));
  };
  
  /**
   * Gestisce il toggle (selezione/deselezione) di una patologia.
   * Se la patologia è già selezionata la rimuove, altrimenti la aggiunge.
   * @param pat - Nome della patologia da selezionare/deselezionare
   */
  const togglePatologia = (pat: string) => {
    // Recupera l'array attuale delle patologie selezionate
    const current = formState.patologie;
    // Se la patologia è già presente la rimuove (filter), altrimenti la aggiunge (spread)
    const newPatologie = current.includes(pat) 
      ? current.filter(p => p !== pat) 
      : [...current, pat];
    // Aggiorna lo stato con il nuovo array di patologie
    handleInputChange('patologie', newPatologie);
  };

  /**
   * Gestisce il salvataggio dell'attività.
   * Valida il titolo, prepara i dati (unendo gli allegati con '|' come separatore),
   * chiama la server action saveActivity e gestisce il risultato.
   */
  const handleSave = async () => {
    // Validazione: il titolo è obbligatorio
    if (!formState.titolo) return alert("Inserisci almeno il titolo.");
    // Imposta lo stato di salvataggio a true (disabilita il dirty check)
    setIsSaving(true);

    // Unisce gli allegati Base64 in una singola stringa usando '|' come separatore
    const allegatiString = formState.allegati.join('|');

    // Prepara l'oggetto dati da salvare, mappando i nomi dei campi del form
    // ai nomi delle colonne del database (descrizioneTesto → descrizione, allegati → immagine)
    const dataToSave = {
      ...formState,
      descrizione: formState.descrizioneTesto, 
      immagine: allegatiString 
    };

    // Chiama la server action per salvare l'attività nel database
    const res = await saveActivity(dataToSave);
    
    // Se il salvataggio ha successo, naviga alla pagina dei materiali
    if (res.success) {
      router.push('/logopedista/imieimateriali');
    } else {
      // In caso di errore, riabilita il form e mostra un alert
      setIsSaving(false);
      alert("Errore: " + res.message);
    }
  };

  return (
    // Container principale: layout verticale con gap tra le sezioni del form
    <div className="w-full min-h-screen bg-white text-black p-4 md:p-8 font-sans flex flex-col gap-8">
      
      {/* 1. HEADER: contiene il pulsante indietro e il titolo della pagina */}
      <CreateHeader onBack={handleBack} />

      {/* 2. TITOLO: campo input per il titolo dell'attività */}
      <CreateTitle 
        value={formState.titolo} 
        onChange={(val) => handleInputChange('titolo', val)} 
      />

      {/* 3. DESCRIZIONE E ALLEGATI: textarea per la descrizione + gestione upload immagini */}
      <CreateDescription 
        textValue={formState.descrizioneTesto}
        onTextChange={(val) => handleInputChange('descrizioneTesto', val)}
        files={formState.allegati}
        onAddFile={handleAddFile}
        onRemoveFile={removeFile}
      />

      {/* 4. ETÀ: slider o input per selezionare la fascia d'età target */}
      <CreateAge 
        value={formState.fasciaEta}
        onChange={(val) => handleInputChange('fasciaEta', val)}
      />

      {/* 5. PATOLOGIA: lista di checkbox/toggle per selezionare le patologie */}
      <CreatePathology 
        selected={formState.patologie}
        onToggle={togglePatologia}
      />

      {/* 6. OBIETTIVO: campo input per l'obiettivo terapeutico */}
      <CreateObjective 
        value={formState.obbiettivo}
        onChange={(val) => handleInputChange('obbiettivo', val)}
      />

      {/* 7. ACCESSIBILITÀ: toggle per rendere l'attività pubblica o privata */}
      <CreateAccessibility 
        isPublic={formState.accessibilita}
        onChange={(val) => handleInputChange('accessibilita', val)}
      />

      {/* 8. SALVA: pulsante per salvare l'attività nel database */}
      <CreateSaveButton 
        onSave={handleSave}
        isSaving={isSaving}
      />

    </div>
  );
}