/**
 * Attività terapeutica.
 */
export interface Activity {

  id: string;

  titolo: string;

  descrizione: string;

  istruzioni: string;

  fasciaEta: number;

  patologie: string[];

  creatore: string;

}