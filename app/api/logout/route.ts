// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from "next/server";

/**
 * Handler POST per l'endpoint /api/logout
 * Gestisce il logout dell'utente eliminando il cookie di sessione 'utente'.
 * Non richiede parametri nel body della richiesta.
 */
export async function POST() {
  // Crea una risposta JSON con indicazione di successo
  const response = NextResponse.json({ success: true });
  
  // Elimina il cookie 'utente' impostando il suo valore a stringa vuota
  // e la data di scadenza a una data nel passato (1 gennaio 1970), così il browser lo rimuove automaticamente
  response.cookies.set("utente", "", { 
    path: "/",            // Il cookie viene invalidato per tutte le pagine del sito
    expires: new Date(0)  // Data di scadenza nel passato: il browser elimina immediatamente il cookie
  });

  // Restituisce la risposta con il cookie invalidato
  return response;
}