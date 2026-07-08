import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiDelete } from "../../../lib/http/client";
import { SERVICES } from "../../../lib/config/services";

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

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Chiamata DELETE al microservizio User tramite Gateway
    await apiDelete(`${SERVICES.USER}/${session.ruolo}/${session.id}`);

    // Eliminiamo anche il cookie per fare logout automatico dal frontend
    const response = NextResponse.json({ success: true });
    response.cookies.set("utente", "", { path: "/", expires: new Date(0) });

    return response;
  } catch (error) {
    console.error("Errore eliminazione account API:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}