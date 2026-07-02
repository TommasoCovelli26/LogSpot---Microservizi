// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Logopedista from "@/models/Logopedista";
import Paziente from "@/models/Paziente";

// Tipo TypeScript che rappresenta la struttura di un record Logopedista nel database
type LogopedistaDB = {
  pIva: string;      // Partita IVA del logopedista (chiave primaria)
  nome: string;      // Nome del logopedista
  cognome: string;   // Cognome del logopedista
  email: string;     // Email del logopedista
  password: string;  // Password del logopedista
};

// Tipo TypeScript che rappresenta la struttura di un record Paziente nel database
type PazienteDB = {
  cf: string;        // Codice fiscale del paziente (chiave primaria)
  nome: string;      // Nome del paziente
  cognome: string;   // Cognome del paziente
  email: string;     // Email del paziente
  password: string;  // Password del paziente
};

/**
 * Handler POST per l'endpoint /api/login
 * Gestisce l'autenticazione degli utenti (logopedisti e pazienti).
 * Verifica le credenziali prima nella tabella Logopedista, poi nella tabella Paziente.
 * Se le credenziali sono corrette, imposta un cookie HTTP-only con i dati dell'utente.
 */
export async function POST(request: Request) {
  try {
    // Estrae email e password dal corpo della richiesta JSON
    const { email, password } = await request.json();

    // Validazione: verifica che email e password siano presenti
    if (!email || !password) {
      // Restituisce errore 400 (Bad Request) se mancano i campi obbligatori
      return NextResponse.json(
        { error: "Email e password obbligatorie" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // --- Controllo LOGOPEDISTA ---
    const logopedista = (await Logopedista.findOne({ email, password })
      .select("pIva nome cognome email password")
      .lean()) as LogopedistaDB | null;

    // Se un logopedista è stato trovato con le credenziali fornite
    if (logopedista) {
      // Costruisce l'oggetto con i dati dell'utente autenticato e il suo ruolo
      const userData = {
        ruolo: "logopedista",           // Imposta il ruolo come logopedista
        utente: {
          nome: logopedista.nome,        // Nome del logopedista
          cognome: logopedista.cognome,  // Cognome del logopedista
          email: logopedista.email,      // Email del logopedista
          pIva: logopedista.pIva,        // Partita IVA del logopedista
        },
      };

      // Crea la risposta JSON con i dati dell'utente
      const response = NextResponse.json(userData);

      // Imposta il cookie 'utente' con i dati serializzati in JSON
      response.cookies.set("utente", JSON.stringify(userData), {
        httpOnly: true,              // Il cookie è accessibile solo lato server (non da JavaScript client)
        path: "/",                   // Il cookie è valido per tutte le pagine del sito
        maxAge: 60 * 60 * 24 * 7,   // Scadenza del cookie: 7 giorni (in secondi)
      });

      // Restituisce la risposta con il cookie impostato
      return response;
    }

    // --- Controllo PAZIENTE ---
    // Se non è stato trovato un logopedista, cerca un paziente con le stesse credenziali
    const paziente = (await Paziente.findOne({ email, password })
      .select("cf nome cognome email password")
      .lean()) as PazienteDB | null;

    // Se un paziente è stato trovato con le credenziali fornite
    if (paziente) {
      // Costruisce l'oggetto con i dati dell'utente autenticato e il suo ruolo
      const userData = {
        ruolo: "paziente",             // Imposta il ruolo come paziente
        utente: {
          nome: paziente.nome,          // Nome del paziente
          cognome: paziente.cognome,    // Cognome del paziente
          email: paziente.email,        // Email del paziente
          cf: paziente.cf,              // Codice fiscale del paziente
        },
      };

      // Crea la risposta JSON con i dati dell'utente
      const response = NextResponse.json(userData);

      // Imposta il cookie 'utente' con i dati serializzati in JSON
      response.cookies.set("utente", JSON.stringify(userData), {
        httpOnly: true,              // Il cookie è accessibile solo lato server
        path: "/",                   // Il cookie è valido per tutte le pagine
        maxAge: 60 * 60 * 24 * 7,   // Scadenza del cookie: 7 giorni
      });

      // Restituisce la risposta con il cookie impostato
      return response;
    }

    // Se né logopedista né paziente sono stati trovati, le credenziali non sono valide
    return NextResponse.json(
      { error: "Credenziali non valide" },
      { status: 401 }  // 401 Unauthorized: credenziali errate
    );
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error("Errore login:", error);
    // Restituisce errore 500 (Internal Server Error) in caso di eccezione
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
