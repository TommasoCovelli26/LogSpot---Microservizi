import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Logopedista from "@/models/Logopedista";
import Paziente from "@/models/Paziente";

/**
 * Handler POST per l'endpoint /api/registrazione
 * Gestisce la registrazione di nuovi utenti (logopedisti e pazienti).
 * Verifica che tutti i campi siano compilati e che l'email non sia già in uso.
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const {
      ruolo,
      nome,
      cognome,
      dataNascita,
      numTelefono,
      email,
      password,
      codice,
    } = await req.json();

    if (
      !ruolo ||
      !nome ||
      !cognome ||
      !dataNascita ||
      !numTelefono ||
      !email ||
      !password ||
      !codice
    ) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }

    const existingUser = await Promise.all([
      Logopedista.findOne({ email }).select("_id").lean(),
      Paziente.findOne({ email }).select("_id").lean(),
    ]);

    if (existingUser[0] || existingUser[1]) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 409 }
      );
    }

    if (ruolo === "logopedista") {
      await Logopedista.create({
        pIva: codice,
        nome,
        cognome,
        dataNascita: dataNascita || null,
        numTelefono: numTelefono || null,
        email,
        password,
      });
    } else if (ruolo === "paziente") {
      await Paziente.create({
        cf: codice,
        nome,
        cognome,
        dataNascita: dataNascita || null,
        numTelefono: numTelefono || null,
        email,
        password,
      });
    } else {
      return NextResponse.json(
        { error: "Ruolo non valido" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Registrazione avvenuta con successo" });
  } catch (error) {
    console.error("Errore registrazione:", error);
    return NextResponse.json(
      { error: "Errore del server" },
      { status: 500 }
    );
  }
}
