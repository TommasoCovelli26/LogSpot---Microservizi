import { NextResponse } from "next/server";
import { apiPost } from "../../../lib/http/client";
import { GATEWAY_URL } from "../../../lib/config/services"; // Assicurati che GATEWAY_URL sia esportato in services.ts

export async function POST(req: Request) {
  try {
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

    // Validazione iniziale
    if (!ruolo || !nome || !cognome || !dataNascita || !numTelefono || !email || !password || !codice) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }

    // Costruiamo il payload in base al ruolo.
    // L'AuthController in Java si aspetta pIva per il logopedista e cf per il paziente.
    const payload = ruolo === "logopedista" 
      ? { pIva: codice, nome, cognome, dataNascita, numTelefono, email, password }
      : { cf: codice, nome, cognome, dataNascita, numTelefono, email, password };

    // Determiniamo l'endpoint del Gateway (basandoci sulle tue rotte in application.properties)
    const endpoint = ruolo === "logopedista"
      ? `${GATEWAY_URL}/api/auth/register/logopedista`
      : `${GATEWAY_URL}/api/auth/register/paziente`;

    // Effettuiamo la chiamata al microservizio tramite Gateway
    await apiPost(endpoint, payload);

    return NextResponse.json({ message: "Registrazione avvenuta con successo" });
  } catch (error: any) {
    console.error("Errore registrazione API:", error);

    return NextResponse.json(
        {
            message: error.message,
            status: error.status,
            response: error.response,
            stack: error.stack
        },
        {
            status: error.status ?? 500
        }
    );
}
}