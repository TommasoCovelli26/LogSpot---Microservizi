// Direttiva per indicare che questo è un componente client-side
'use client';

// Importazione degli hook React per stato e effetti collaterali
import { useEffect, useState } from 'react';
// Importazione dell'hook per leggere i parametri di ricerca dall'URL
import { useSearchParams } from 'next/navigation';
// Importazione del componente lista esercizi
import ExercisesList from './exercises-list';
// Importazione del tipo AssignedExercise per la tipizzazione
import { AssignedExercise } from '../../lib/activities';

/**
 * Componente wrapper che gestisce il fetching e lo stato degli esercizi del paziente.
 * Legge query e filtro dall'URL e recupera gli esercizi tramite API.
 * @param patientCf - Codice fiscale del paziente
 */
export default function ExercisesListWrapper({ patientCf }: { patientCf: string }) {
  // Legge i parametri di ricerca correnti dall'URL
  const searchParams = useSearchParams();
  // Estrae il termine di ricerca (stringa vuota se assente)
  const query = searchParams.get('query') || '';
  // Estrae il filtro attivo (default: 'tutti')
  const filter = searchParams.get('filter') || 'tutti';
  
  // Stato per la lista degli esercizi assegnati
  const [exercises, setExercises] = useState<AssignedExercise[]>([]);
  // Stato per indicare se i dati sono in caricamento
  const [loading, setLoading] = useState(true);

  // Effetto per recuperare gli esercizi dall'API ogni volta che cambiano cf, query o filtro
  useEffect(() => {
    // Funzione asincrona per il fetching degli esercizi
    const fetchExercises = async () => {
      // Imposta lo stato di caricamento
      setLoading(true);
      try {
        // Chiama l'API degli esercizi con i parametri di ricerca
        const response = await fetch(
          `/api/esercizi?cf=${patientCf}&query=${encodeURIComponent(query)}&filter=${filter}`
        );
        
        // Lancia un errore se la risposta non è OK
        if (!response.ok) {
          throw new Error('Errore nel caricamento degli esercizi');
        }
        
        // Parsifica la risposta JSON e aggiorna lo stato
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        // Logga l'errore in console e resetta la lista
        console.error('Errore:', error);
        setExercises([]);
      } finally {
        // Disattiva lo stato di caricamento in ogni caso
        setLoading(false);
      }
    };

    // Esegue il fetching degli esercizi
    fetchExercises();
  }, [patientCf, query, filter]); // Dipendenze: riesegue quando cambiano

  // Mostra un messaggio di caricamento durante il fetching
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Caricamento esercizi...
      </div>
    );
  }

  // Renderizza la lista degli esercizi con i dati ottenuti
  return <ExercisesList exercises={exercises} />;
}
