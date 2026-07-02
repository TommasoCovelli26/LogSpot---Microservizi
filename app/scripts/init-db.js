// Importa la libreria better-sqlite3 per interagire con il database SQLite in modo sincrono
import Database from "better-sqlite3";
// Importa il modulo 'fs' (file system) di Node.js per operazioni su file (leggere, eliminare, verificare esistenza)
import fs from "fs";
// Importa il modulo 'path' di Node.js per costruire percorsi di file in modo cross-platform
import path from "path";

// Stampa un messaggio nella console per indicare l'inizio del processo di inizializzazione del database
console.log("🔄 Inizializzazione database LogSpot...");

// Costruisce il percorso assoluto al file del database SQLite (app/data/database.db)
const dbPath = path.join(process.cwd(), "app/data/database.db");
// Costruisce il percorso assoluto al file SQL contenente lo schema delle tabelle (app/data/schema.sql)
const schemaPath = path.join(process.cwd(), "app/data/schema.sql");
// Costruisce il percorso assoluto al file SQL contenente i dati di popolamento (app/data/populate.sql)
const populatePath = path.join(process.cwd(), "app/data/populate.sql");

// Controlla se esiste già un file database.db nel percorso indicato
if (fs.existsSync(dbPath)) {
  // Se il database esiste, lo elimina per ripartire da zero con dati puliti
  console.log("🗑️  Database esistente trovato. Eliminazione...");
  // Cancella il file del database esistente in modo sincrono
  fs.unlinkSync(dbPath);
}

// Crea una nuova istanza del database SQLite (il file database.db viene creato automaticamente)
const db = new Database(dbPath);

// Legge l'intero contenuto del file schema.sql come stringa UTF-8 (contiene le istruzioni CREATE TABLE)
const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
// Legge l'intero contenuto del file populate.sql come stringa UTF-8 (contiene le istruzioni INSERT INTO)
const populateSQL = fs.readFileSync(populatePath, "utf-8");

try {
  // Esegue le istruzioni SQL dello schema per creare tutte le tabelle del database
  console.log("📐 Creazione tabelle...");
  db.exec(schemaSQL);

  // Esegue le istruzioni SQL di popolamento per inserire i dati di esempio nelle tabelle
  console.log("📥 Inserimento dati...");
  db.exec(populateSQL);

  // Se tutto è andato a buon fine, stampa un messaggio di successo
  console.log("✅ Database creato e popolato correttamente!");
} catch (err) {
  // In caso di errore durante la creazione o il popolamento, stampa l'errore nella console
  console.error("❌ Errore:", err);
} finally {
  // Chiude la connessione al database in ogni caso (successo o errore) per liberare le risorse
  db.close();
}
