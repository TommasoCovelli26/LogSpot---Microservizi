// Direttiva Next.js: indica che questo è un componente client-side (necessario per useState, useEffect, useSearchParams)
"use client";

// Importa gli hook useState e useEffect da React per gestire stato locale e side-effects
import { useState, useEffect } from "react";
// Importa gli hook useRouter e useSearchParams da Next.js per navigazione e lettura parametri URL
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Pagina di Registrazione dell'applicazione.
 * Il form si adatta dinamicamente in base al parametro URL 'ruolo' (logopedista o paziente).
 * Per i logopedisti richiede la Partita IVA, per i pazienti il Codice Fiscale.
 * Alla sottomissione, invia i dati all'API /api/registrazione e reindirizza al login.
 * Corrisponde alla route '/registrazione?ruolo=logopedista|paziente'.
 */
export default function RegistrazionePage() {
  // Hook per la navigazione programmatica (redirect dopo registrazione)
  const router = useRouter();
  // Hook per leggere i parametri dalla query string dell'URL
  const searchParams = useSearchParams();

  // Legge il ruolo dalla query string: può essere 'logopedista' o 'paziente'
  const ruolo = searchParams.get("ruolo"); // logopedista | paziente

  // Stato del form: contiene tutti i campi di input della registrazione
  const [form, setForm] = useState({
    nome: "",        // Nome dell'utente
    cognome: "",     // Cognome dell'utente
    dataNascita: "", // Data di nascita dell'utente
    numTelefono: "", // Numero di telefono dell'utente
    email: "",       // Email dell'utente (usata come credenziale di login)
    password: "",    // Password dell'utente
    codice: "",      // Codice identificativo: P.IVA per logopedista, CF per paziente
  });

  // Effect: se il parametro 'ruolo' non è presente nell'URL, reindirizza alla homepage
  // Impedisce l'accesso diretto alla pagina senza aver scelto il tipo di utente
  useEffect(() => {
    if (!ruolo) {
      // Se qualcuno arriva qui senza ruolo → torna alla home
      router.push("/");
    }
  }, [ruolo, router]); // Dipendenze: riesegue se ruolo o router cambiano

  /**
   * Gestisce il cambiamento di valore di qualsiasi campo input del form.
   * Aggiorna dinamicamente il campo corretto nello stato usando il nome dell'input come chiave.
   * @param e - Evento di cambiamento dell'input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Spread dell'oggetto form esistente e aggiornamento del campo modificato
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Gestisce la sottomissione del form di registrazione.
   * Invia tutti i dati del form all'API di registrazione e reindirizza al login in caso di successo.
   * @param e - Evento del form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Previene il comportamento di default del form (reload della pagina)
    e.preventDefault();

    // Invia una richiesta POST all'API di registrazione con ruolo e dati del form
    const res = await fetch("/api/registrazione", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Serializza ruolo e tutti i campi del form nel corpo della richiesta
      body: JSON.stringify({
        ruolo,
        ...form,
      }),
    });

    // Se la registrazione è andata a buon fine, reindirizza alla pagina di login
    if (res.ok) {
      router.push("/login");
    } else {
      // Se la registrazione fallisce, mostra un alert di errore
      alert("Errore durante la registrazione");
    }
  };

  // Se il ruolo non è presente, non renderizza nulla (l'useEffect farà il redirect)
  if (!ruolo) return null;

  return (
    // Container del form: centrato orizzontalmente, con bordo e padding
    <div style={styles.container}>
      {/* Titolo dinamico: mostra "Logopedista" o "Paziente" in base al ruolo selezionato */}
      <h1>Registrazione {ruolo === "logopedista" ? "Logopedista" : "Paziente"}</h1>

      {/* Form di registrazione: chiama handleSubmit alla sottomissione */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Campo Nome */}
        <input name="nome" placeholder="Nome" onChange={handleChange} required style={styles.input} />
        {/* Campo Cognome */}
        <input name="cognome" placeholder="Cognome" onChange={handleChange} required style={styles.input} />
        {/* Campo Data di Nascita: input di tipo date per il selettore data nativo */}
        <input type="date" name="dataNascita" onChange={handleChange} required style={styles.input} />
        {/* Campo Numero di Telefono */}
        <input name="numTelefono" placeholder="Numero di telefono" onChange={handleChange} required style={styles.input} />
        {/* Campo Email: input di tipo email per validazione HTML nativa */}
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
        {/* Campo Password: input di tipo password per mascherare il testo */}
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={styles.input} />

        {/* Campo condizionale: Partita IVA - mostrato solo se il ruolo è 'logopedista' */}
        {ruolo === "logopedista" && (
          <input
            name="codice"
            placeholder="Partita IVA"
            onChange={handleChange}
            required
            style={styles.input}
          />
        )}

        {/* Campo condizionale: Codice Fiscale - mostrato solo se il ruolo è 'paziente' */}
        {ruolo === "paziente" && (
          <input
            name="codice"
            placeholder="Codice Fiscale"
            onChange={handleChange}
            required
            style={styles.input}
          />
        )}

        {/* Pulsante di submit per completare la registrazione */}
        <button type="submit" style={styles.button}>
          Registrati
        </button>
      </form>
    </div>
  );
}

/**
 * Oggetto degli stili inline CSS per la pagina di registrazione.
 * Definisce gli stili per container, form, input e pulsante.
 */
const styles = {
  // Stile del container principale: larghezza massima 450px, centrato, con bordo arrotondato
  container: {
    maxWidth: "450px",
    margin: "60px auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  // Stile del form: layout a colonna con gap tra gli elementi
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  // Stile degli input: padding interno e dimensione font
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  // Stile del pulsante: sfondo blu, testo bianco, senza bordo
  button: {
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
