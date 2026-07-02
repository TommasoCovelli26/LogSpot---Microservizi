import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; // Legge la variabile ambientale MONGODB_URI dal file .env.local

// Se la variabile MONGODB_URI non è definita, lancia un errore
if (!MONGODB_URI) { 
  throw new Error('Definisci la variabile ambientale MONGODB_URI nel file .env.local');
}

let cached = global.mongoose; // Usa una variabile globale per memorizzare la connessione al database e la promessa di connessione

// Se la variabile globale non è definita, inizializzala
if (!cached) { 
  cached = global.mongoose = { conn: null, promise: null };
}

// Funzione asincrona per connettersi al database MongoDB
async function connectToDatabase() {
  // Se esiste già una connessione, restituiscila
  if (cached.conn) {
    return cached.conn;
  }

  // Se non esiste una promessa di connessione, creala (Serve a prevenire connessioni multiple quando più richieste arrivano contemporaneamente)
  if (!cached.promise) {
    const opts = { bufferCommands: false }; // Opzione per disabilitare il buffering dei comandi quando la connessione non è ancora stabilita
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => { // Connetti a MongoDB usando Mongoose e le opzioni specificate
      return mongoose;
    });
  }
  
  // Attendi la promessa di connessione e memorizza la connessione nella variabile globale
  try {
    cached.conn = await cached.promise;
  } catch (e) { // Se c'è un errore durante la connessione, resetta la promessa di connessione e lancia l'errore
    cached.promise = null;
    throw e;
  }

  return cached.conn; // Restituisci la connessione al database
}

export default connectToDatabase; // Esporta la funzione connectToDatabase per essere utilizzata in altre parti dell'applicazione