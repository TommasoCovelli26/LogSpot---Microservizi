// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Logopedista from "@/models/Logopedista";
import Paziente from "@/models/Paziente";

/**
 * Handler DELETE per l'endpoint /api/elimina-account
 * Elimina definitivamente l'account di un utente dal database.
 * Riceve nel body JSON l'email e il ruolo dell'utente da eliminare.
 * L'eliminazione è irreversibile e, grazie ai vincoli ON DELETE CASCADE nello schema,
 * rimuove automaticamente anche tutti i dati associati (attività, esercizi, commenti, ecc.).
 */
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    // Estrae email e ruolo dal corpo della richiesta JSON
    const { email, ruolo } = await req.json();

    // Validazione: verifica che email e ruolo siano presenti
    if (!email || !ruolo) {
      // Restituisce errore 400 (Bad Request) se mancano i dati obbligatori
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    // Variabile per memorizzare il numero di record eliminati
    let deletedCount = 0;

    // Se il ruolo è 'logopedista', elimina il record dalla tabella Logopedista
    if (ruolo === "logopedista") {
      const result = await Logopedista.deleteOne({ email });
      deletedCount = result.deletedCount ?? 0;
    }

    // Se il ruolo è 'paziente', elimina il record dalla tabella Paziente
    if (ruolo === "paziente") {
      const result = await Paziente.deleteOne({ email });
      deletedCount = result.deletedCount ?? 0;
    }

    // Verifica se l'eliminazione è avvenuta
    if (deletedCount === 0) {
      // Restituisce errore 404 (Not Found) se l'utente non è stato trovato nel database
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Restituisce successo se l'account è stato eliminato correttamente
    return NextResponse.json({ success: true });
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error("Errore eliminazione account:", error);
    // Restituisce errore 500 (Internal Server Error) in caso di eccezione
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
