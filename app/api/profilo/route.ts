import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiGet, apiPut } from "../../../lib/http/client";
import { SERVICES } from "../../../lib/config/services";

/**
 * Funzione di utilità per estrarre l'ID e il ruolo dal cookie
 */
async function getSession() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("utente");
  if (!userCookie) return null;

  try {
    const userData = JSON.parse(userCookie.value);
    const id = userData.ruolo === "logopedista" ? userData.utente.pIva : userData.utente.cf;
    return { id, ruolo: userData.ruolo };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Chiama l'UserController tramite il Gateway (es. /users/logopedista/12345)
    const utente = await apiGet<any>(`${SERVICES.USER}/${session.ruolo}/${session.id}`);

    return NextResponse.json({
      nome: utente.nome,
      cognome: utente.cognome,
      dataNascita: utente.dataNascita ? new Date(utente.dataNascita).toISOString() : null,
      numTelefono: utente.numTelefono ?? null,
      email: utente.email,
      ruolo: session.ruolo,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack,
      },
      {
        status: error.status ?? 500,
      }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    
    // Il backend Java nel tuo UpdateUserRequest accetta attualmente solo nome, cognome, email
    const { nome, cognome, email, dataNascita, numTelefono } = body;

    // Invia i dati al microservizio
    await apiPut(`${SERVICES.USER}/${session.ruolo}/${session.id}`, {
      nome,
      cognome,
      email,
      dataNascita: dataNascita || null,
      numTelefono: numTelefono || null
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore aggiornamento profilo API (PUT):", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}