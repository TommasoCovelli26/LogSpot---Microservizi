import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiGet, apiPut } from "../../../lib/http/client";
import { SERVICES } from "../../../lib/config/services";

function formatItalianDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Funzione di utilità per estrarre l'ID e il ruolo dal cookie
 */
async function getSession() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("utente");
  if (!userCookie) return null;

  try {
    const userData = JSON.parse(userCookie.value);
    const ruolo = userData.ruolo;

    return {
      mongoId: userData.utente?.id,   // sempre l'id Mongo reale
      cf: userData.utente?.cf,        // solo per i pazienti
      ruolo,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // GET: il backend cerca il paziente per CF, il logopedista per id Mongo
    const lookupId = session.ruolo === 'paziente' ? session.cf : session.mongoId;

    const utente = await apiGet<any>(`${SERVICES.USER}/${session.ruolo}/${lookupId}`);

    return NextResponse.json({
      nome: utente.nome,
      cognome: utente.cognome,
      dataNascita: formatItalianDate(utente.dataNascita),
      numTelefono: utente.numTelefono ?? null,
      email: utente.email,
      pIva: utente.pIva ?? null,
      cf: utente.cf ?? null,
      ruolo: session.ruolo,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message, status: error.status, response: error.response, stack: error.stack },
      { status: error.status ?? 500 }
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
    const { nome, cognome, email, dataNascita, numTelefono } = body;

    // PUT: sia updateLogopedista che updatePaziente cercano per id Mongo reale
    await apiPut(`${SERVICES.USER}/${session.ruolo}/${session.mongoId}`, {
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