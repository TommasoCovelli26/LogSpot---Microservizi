/**
 * Esercizio assegnato.
 */
export interface Exercise {

  id: string;

  paziente: string;

  logopedista: string;

  attivita: string;

  dataAssegnazione: string;

  stato: "assegnato" | "in-corso" | "completato";

  durata?: number;

  esito?: string;

}