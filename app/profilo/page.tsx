// Direttiva Next.js: indica che questo è un componente client-side
"use client";

// Importa gli hook React: useEffect per side-effects, useState per lo stato locale
import { useEffect, useState } from "react";
// Importa l'hook useRouter per la navigazione programmatica
import { useRouter } from "next/navigation";
// Importa il font personalizzato Lusitana
import { lusitana } from "@/ui/fonts";

/**
 * Pagina Profilo Utente.
 * Componente Client che gestisce la visualizzazione, modifica e cancellazione
 * del profilo dell'utente loggato (sia logopedista che paziente).
 * Corrisponde alla route '/profilo'.
 */
export default function ProfiloPage() {
  // Hook per la navigazione programmatica
  const router = useRouter();

  // Stato per memorizzare i dati dell'utente corrente
  const [utente, setUtente] = useState<any>(null);
  // Stato per tracciare se siamo in modalità modifica
  const [edit, setEdit] = useState(false);
  // Stato per memorizzare i dati originali prima della modifica (per il ripristino)
  const [utenteOriginale, setUtenteOriginale] = useState<any>(null);

  // Effect: recupera i dati del profilo al caricamento della pagina
 useEffect(() => {
  // Recupera la sessione utente dal localStorage
  const sessione = localStorage.getItem("utente");
  // Se la sessione non esiste, reindirizza al login
  if (!sessione) {
    router.push("/login");
    return;
  }

  // Destruttura email e ruolo dalla sessione
  const { email, ruolo } = JSON.parse(sessione);

  /**
   * Funzione asincrona per caricare il profilo completo.
   * Chiama l'API /api/profilo con email e ruolo come parametri.
   */
  const caricaProfilo = async () => {
    try {
      // Chiamata GET all'API profilo con email codificata e ruolo
      const res = await fetch(
        `/api/profilo?email=${encodeURIComponent(email)}&ruolo=${ruolo}`
      );

      // Se la risposta non è OK, lancia un errore
      if (!res.ok) {
        throw new Error("Errore risposta server");
      }

      // Parsing della risposta JSON
      const data = await res.json();
      // Salva i dati utente nello stato, aggiungendo ruolo e email originale
      setUtente({
        ...data,
        ruolo,
        emailOriginale: data.email, // Serve per identificare l'utente durante l'aggiornamento
      });
    } catch (err) {
      console.error("Errore caricamento profilo:", err);
      alert("Errore nel caricamento del profilo");
      // In caso di errore, reindirizza alla home
      router.push("/");
    }
  };

  // Avvia il caricamento del profilo
  caricaProfilo();
  }, []); // Si esegue solo al mount del componente




  /**
   * Handler per la modifica dei campi input.
   * Aggiorna lo stato utente con il nuovo valore del campo modificato.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUtente({ ...utente, [e.target.name]: e.target.value });
  };

  /**
   * Funzione helper per renderizzare un campo del profilo.
   * In modalità visualizzazione mostra il valore come testo,
   * in modalità modifica mostra un input editabile.
   * @param label - Etichetta del campo
   * @param name - Nome della proprietà nell'oggetto utente
   */
  const campo = (label: string, name: string) => (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-600">{label}</span>

      {!edit ? (
        <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800">
          {utente[name] || "-"}
        </span>
      ) : (
        <input
          name={name}
          value={utente[name] || ""}
          onChange={handleChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      )}
    </div>
  );


  /**
   * Funzione per salvare le modifiche al profilo.
   * Invia una richiesta PUT all'API /api/profilo con i dati aggiornati.
   */
  const salvaModifiche = async () => {
    // Chiamata PUT con i dati utente aggiornati
    const res = await fetch("/api/profilo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        ...utente,
        emailOriginale: utente.emailOriginale, // Email originale per identificare il record
        ruolo: utente.ruolo, // Ruolo per identificare la tabella corretta
        }),
    });

    // Se la risposta è positiva, notifica e disattiva la modifica
    if (res.ok) {
        alert("Profilo aggiornato!");
        setEdit(false);
    } else {
        alert("Errore nel salvataggio");
    }
  };

  /**
   * Funzione per avviare la modalità modifica.
   * Salva una copia dei dati attuali per poterli ripristinare.
   */
  const avviaModifica = () => {
    // Salva i dati originali per un eventuale annullamento
    setUtenteOriginale(utente);
    // Attiva la modalità modifica
    setEdit(true);
  };

  /**
   * Funzione per annullare le modifiche in corso.
   * Chiede conferma e ripristina i dati originali.
   */
  const annullaModifiche = () => {
    // Chiede conferma all'utente
    const conferma = window.confirm("Sei sicuro di annullare le modifiche?");
    if (!conferma) return;
    // Ripristina i dati originali salvati
    if (utenteOriginale) {
      setUtente(utenteOriginale);
    }
    // Disattiva la modalità modifica
    setEdit(false);
  };


  /**
   * Funzione per eliminare definitivamente l'account.
   * Chiede conferma, invia una DELETE all'API e reindirizza al login.
   */
  const eliminaAccount = async () => {
    // Se i dati utente non sono disponibili, non procedere
    if (!utente) return;

    // Chiede conferma all'utente prima di eliminare
    const conferma = confirm("Sei sicuro di voler eliminare l'account?");
    if (!conferma) return;

    // Chiamata DELETE all'API elimina-account con email e ruolo
    await fetch("/api/elimina-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        email: utente.email,
        ruolo: utente.ruolo,
        }),
    });

    // Rimuove la sessione dal localStorage dopo l'eliminazione
    localStorage.removeItem("utente");
    // Reindirizza alla pagina di login
    router.push("/login");
  };


  // Se i dati utente non sono ancora caricati, mostra indicatore di caricamento
  if (!utente) return <p className="text-center py-10 text-gray-500">Caricamento...</p>;

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      {/* Container centrato con larghezza massima */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Sezione header: titolo + avatar */}
        <div className="flex flex-col gap-3">
          <div>
            {/* Titolo della pagina con font Lusitana */}
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-blue-600 font-bold`}>
              Profilo
            </h1>
            {/* Sottotitolo descrittivo */}
            <p className="text-gray-500 mt-2">
              Gestisci i tuoi dati personali e aggiorna le informazioni di contatto.
            </p>
          </div>

          {/* Sezione avatar e info utente */}
          <div className="flex items-center gap-3">
            {/* Avatar circolare con iniziali dell'utente */}
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
              {utente.nome?.[0]}
              {utente.cognome?.[0]}
            </div>
            <div>
              {/* Nome completo dell'utente */}
              <h2 className="text-xl font-semibold text-gray-900">
                {utente.nome} {utente.cognome}
              </h2>
              {/* Badge con il ruolo dell'utente (logopedista/paziente) */}
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                {utente.ruolo}
              </span>
            </div>
          </div>
        </div>

        {/* Card con i campi del profilo: griglia 2 colonne su desktop */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Campo Nome */}
            {campo("Nome", "nome")}
            {/* Campo Cognome */}
            {campo("Cognome", "cognome")}
            {/* Campo Data di nascita */}
            {campo("Data di nascita", "dataNascita")}
            {/* Campo Telefono */}
            {campo("Telefono", "numTelefono")}
            {/* Campo Email: occupa tutta la larghezza (2 colonne) */}
            <div className="md:col-span-2">{campo("Email", "email")}</div>
          </div>
        </div>

        {/* Sezione pulsanti azioni: modifica, salva, elimina account */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Se non in modifica: mostra pulsante Modifica, altrimenti pulsante Annulla */}
          {!edit ? (
            <button
              onClick={avviaModifica}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-blue-700"
            >
              ✏️ Modifica
            </button>
          ) : (
            <button
              onClick={annullaModifiche}
              className="inline-flex items-center justify-center rounded-full bg-gray-200 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-700 shadow-sm transition hover:bg-gray-300"
            >
              ✖️ Annulla
            </button>
          )}

          {/* Pulsante Salva: visibile solo in modalità modifica */}
          {edit && (
            <button
              onClick={salvaModifiche}
              className="inline-flex items-center justify-center rounded-full bg-green-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-green-600"
            >
              💾 Salva modifiche
            </button>
          )}

          {/* Pulsante Elimina account: sempre visibile, apre conferma */}
          <button
            onClick={eliminaAccount}
            className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-red-600"
          >
            🗑️ Elimina account
          </button>
        </div>
      </div>
    </main>
  );
}
