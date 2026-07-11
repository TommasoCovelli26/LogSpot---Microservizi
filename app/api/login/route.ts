import { NextResponse } from "next/server";
import { apiPost } from "../../../lib/http/client";
import { GATEWAY_URL } from "../../../lib/config/services"; // Assicurati di esportare GATEWAY_URL in services.ts

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password obbligatorie" },
        { status: 400 }
      );
    }

    // Effettua la chiamata POST al microservizio User (passando per il Gateway)
    // Assicurati che l'AuthController nel backend risponda a /api/auth/login
    const authResponse = await apiPost<any>(`${GATEWAY_URL}/api/auth/login`, {
      email,
      password
    });

    const utente = authResponse?.utente || {};
    const ruolo = authResponse?.ruolo?.toLowerCase?.() || authResponse?.ruolo;
    const pIva = utente.pIva ?? utente.PIva ?? null;
    const cf = utente.cf ?? null;

    // Dal backend supponiamo torni un oggetto con utente, ruolo (e magari il token JWT)
    if (authResponse && authResponse.utente) {
      const userData = {
        ruolo,
        utente: {
          ...utente,
          pIva,
          cf,
          codice: pIva ?? cf,
        },
        token: authResponse.token // Se il tuo backend genera un JWT
      };

      const response = NextResponse.json(userData);

      response.cookies.set("utente", JSON.stringify(userData), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { error: "Credenziali non valide" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Errore login via API:", error);
    return NextResponse.json(
      { error: "Credenziali non valide o errore del server" },
      { status: 401 } // Fallback a 401 per sicurezza
    );
  }
}