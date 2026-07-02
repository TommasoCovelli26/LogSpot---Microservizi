import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Logopedista from "@/models/Logopedista";
import Paziente from "@/models/Paziente";

/**
 * Handler GET per l'endpoint /api/profilo
 * Recupera i dati del profilo di un utente (logopedista o paziente) in base a email e ruolo.
 * I parametri vengono passati come query string: ?email=...&ruolo=...
 */
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const ruolo = searchParams.get("ruolo");

    if (!email || !ruolo) {
      return NextResponse.json(
        { error: "Parametri mancanti" },
        { status: 400 }
      );
    }

    let utente: any = null;

    if (ruolo === "logopedista") {
      utente = await Logopedista.findOne({ email })
        .select("nome cognome dataNascita numTelefono email")
        .lean();
    }

    if (ruolo === "paziente") {
      utente = await Paziente.findOne({ email })
        .select("nome cognome dataNascita numTelefono email")
        .lean();
    }

    if (!utente) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      nome: utente.nome,
      cognome: utente.cognome,
      dataNascita: utente.dataNascita ? new Date(utente.dataNascita).toISOString() : null,
      numTelefono: utente.numTelefono ?? null,
      email: utente.email,
      ruolo,
    });
  } catch (error) {
    console.error("Errore API profilo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

/**
 * Handler PUT per l'endpoint /api/profilo
 * Aggiorna i dati del profilo di un utente (logopedista o paziente).
 * Riceve nel body JSON i nuovi dati e l'email originale per identificare il record da aggiornare.
 */
export async function PUT(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const {
      ruolo,
      nome,
      cognome,
      dataNascita,
      numTelefono,
      email,
      emailOriginale,
    } = body;

    if (!emailOriginale || !ruolo) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    if (ruolo === "logopedista") {
      await Logopedista.updateOne(
        { email: emailOriginale },
        {
          $set: {
            nome,
            cognome,
            dataNascita: dataNascita || null,
            numTelefono: numTelefono || null,
            email,
          },
        }
      );
    }

    if (ruolo === "paziente") {
      await Paziente.updateOne(
        { email: emailOriginale },
        {
          $set: {
            nome,
            cognome,
            dataNascita: dataNascita || null,
            numTelefono: numTelefono || null,
            email,
          },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore aggiornamento profilo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

