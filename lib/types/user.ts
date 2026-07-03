/**
 * Utente generico.
 */
export interface User {

  id: string;

  nome: string;

  cognome: string;

  email: string;

  ruolo: "logopedista" | "paziente";

}

/**
 * Logopedista.
 */
export interface Logopedista extends User {

  pIva: string;

  preferiti: string[];

}

/**
 * Paziente.
 */
export interface Paziente extends User {

  cf: string;

  logopedista: string;

}

/**
 * Richiesta Login.
 */
export interface LoginRequest {

  email: string;

  password: string;

}

/**
 * Risposta Login.
 */
export interface LoginResponse {

  token: string;

  utente: User;

}