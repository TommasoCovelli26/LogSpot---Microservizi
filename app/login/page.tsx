// Direttiva Next.js: indica che questo è un componente client-side (necessario per useState, useRouter)
"use client";

// Importa l'hook useState da React per gestire lo stato locale del form
import { useState } from "react";
// Importa l'hook useRouter da Next.js per la navigazione programmatica
import { useRouter } from "next/navigation";
// Importa il componente Link di Next.js per la navigazione client-side
import Link from "next/link";

/**
 * Pagina di Login dell'applicazione.
 * Presenta un form con campi email e password per l'autenticazione dell'utente.
 * Alla sottomissione, invia le credenziali all'API /api/login.
 * In caso di successo, salva i dati utente in localStorage e reindirizza alla dashboard.
 * Corrisponde alla route '/login'.
 */
export default function LoginPage() {
  // Hook per la navigazione programmatica (redirect dopo login)
  const router = useRouter();

  // Stato per il campo email del form
  const [email, setEmail] = useState("");
  // Stato per il campo password del form
  const [password, setPassword] = useState("");
  // Stato per il messaggio di errore da mostrare all'utente
  const [error, setError] = useState("");

  /**
   * Gestisce la sottomissione del form di login.
   * Invia le credenziali all'API, salva i dati utente in localStorage
   * e reindirizza alla dashboard in caso di successo.
   * @param e - Evento del form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Previene il comportamento di default del form (reload della pagina)
    e.preventDefault();
    // Resetta eventuali errori precedenti
    setError("");

    try {
      // Invia una richiesta POST all'API di login con email e password
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Serializza le credenziali nel corpo della richiesta
        body: JSON.stringify({ email, password }),
      });

      // Se la risposta non è ok (status != 2xx), lancia un errore
      if (!res.ok) {
        throw new Error("Credenziali non valide");
      }

      // Login riuscito: legge i dati dell'utente dalla risposta JSON
      const data = await res.json();
      // Salva i dati dell'utente in localStorage per mantenerli tra le sessioni
      // Memorizza email, ruolo e codice identificativo (pIva per logopedista, cf per paziente)
      localStorage.setItem(
        "utente",
        JSON.stringify({
          email: data.utente.email,
          ruolo: data.ruolo,
          codice:
            data.ruolo === "logopedista"
              ? data.utente.pIva
              : data.utente.cf,
        })

      );
      // Reindirizza l'utente alla pagina dashboard
      router.push("/dashboard");

    } catch (err) {
      // In caso di errore (credenziali errate o errore di rete), mostra un messaggio
      setError("Email o password errati");
    }
  };

  return (
    // Container del form: centrato orizzontalmente, con bordo e padding
    <div style={styles.container}>
      {/* Titolo della pagina di login */}
      <h1>Login</h1>

      {/* Form di login: chiama handleSubmit alla sottomissione */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Campo input per l'email: tipo email con validazione HTML nativa */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        {/* Campo input per la password: tipo password per mascherare il testo */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {/* Pulsante di submit per effettuare il login */}
        <button type="submit" style={styles.button}>
          Accedi
        </button>

        {/* Link alla pagina di scelta utente per la registrazione */}
        <p style={styles.registerText}>
          Non hai un account? <Link href="/scelta-utente" style={styles.registerLink}>Registrati</Link>
        </p>

        {/* Messaggio di errore condizionale: viene mostrato solo se c'è un errore */}
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

/**
 * Oggetto degli stili inline CSS per la pagina di login.
 * Definisce gli stili per container, form, input, pulsante, testo di registrazione e messaggi di errore.
 */
const styles = {
  // Stile del container principale: larghezza massima 400px, centrato, con bordo arrotondato
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center" as const,
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
  // Stile del testo "Non hai un account?": piccolo, colore grigio scuro
  registerText: {
    marginTop: "4px",
    fontSize: "14px",
    color: "#333",
  },
  // Stile del link "Registrati": blu con sottolineatura
  registerLink: {
    color: "#2563eb",
    textDecoration: "underline",
    cursor: "pointer",
  },
  // Stile del messaggio di errore: testo rosso
  error: {
    color: "red",
    marginTop: "10px",
  },
};
