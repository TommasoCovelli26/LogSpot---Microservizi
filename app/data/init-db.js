// init-db.js
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const mongoose = require('mongoose');

// ==========================================
// 1. DEFINIZIONE DEGLI SCHEMI E MODELLI
// ==========================================
const LogopedistaSchema = new mongoose.Schema({
    pIva: { type: String, unique: true },
    cognome: String,
    nome: String,
    email: { type: String, unique: true },
    password: String,
    preferiti: [{
        attivita: mongoose.Schema.Types.ObjectId,
        dataSalvataggio: { type: Date, default: Date.now }
    }]
});

const PazienteSchema = new mongoose.Schema({
    cf: { type: String, unique: true },
    cognome: String,
    nome: String,
    email: { type: String, unique: true },
    password: String,
    logopedista: { type: mongoose.Schema.Types.ObjectId, ref: 'Logopedista' }
});

const AttivitaSchema = new mongoose.Schema({
    titolo: String,
    descrizione: String,
    patologie: [{ type: String }],
    accessibilita: Boolean,
    creatore: { type: mongoose.Schema.Types.ObjectId, ref: 'Logopedista' },
    materiali: [{ tipo: String, domanda: String }],
    commenti: [{
        logopedista: mongoose.Schema.Types.ObjectId,
        messaggio: String,
        data: { type: Date, default: Date.now }
    }]
});

const EsercizioSchema = new mongoose.Schema({
    dataAssegnazione: Date,
    statoCompletamento: String,
    durata: Number,
    attivita: { type: mongoose.Schema.Types.ObjectId, ref: 'Attivita' },
    logopedista: { type: mongoose.Schema.Types.ObjectId, ref: 'Logopedista' },
    paziente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paziente' },
    feedback: { messaggio: String, data: Date }
});

// Creazione dei Modelli Mongoose
const Logopedista = mongoose.models.Logopedista || mongoose.model('Logopedista', LogopedistaSchema);
const Paziente = mongoose.models.Paziente || mongoose.model('Paziente', PazienteSchema);
const Attivita = mongoose.models.Attivita || mongoose.model('Attivita', AttivitaSchema);
const Esercizio = mongoose.models.Esercizio || mongoose.model('Esercizio', EsercizioSchema);

// ==========================================
// 2. FUNZIONI DI SUPPORTO PER DATI CASUALI
// ==========================================
const nomi = ['Mario', 'Luigi', 'Giulia', 'Francesca', 'Andrea', 'Matteo', 'Sara', 'Martina', 'Luca', 'Elena', 'Chiara', 'Alessandro'];
const cognomi = ['Rossi', 'Bianchi', 'Verdi', 'Russo', 'Ferrari', 'Esposito', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno'];
const patologieList = ['DISLALIA', 'AFASIA', 'DISLESSIA', 'BALBUZIE', 'DEGLUTIZIONE ATIPICA', 'DISFONIA'];

const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ==========================================
// 3. LOGICA PRINCIPALE DI INIZIALIZZAZIONE
// ==========================================
async function initDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI non definita nel file .env.local");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connesso a MongoDB per il progetto Logopedia');

        // Svuotiamo il database per un'installazione pulita
        await Logopedista.deleteMany({});
        await Paziente.deleteMany({});
        await Attivita.deleteMany({});
        await Esercizio.deleteMany({});
        console.log('✓ Database ripulito dalle vecchie collezioni');

        const ObjectId = mongoose.Types.ObjectId;

        // Generiamo preventivamente gli ID per creare le relazioni (chiavi esterne) in modo coerente
        const logoIds = Array.from({ length: 100 }, () => new ObjectId());
        const pazIds = Array.from({ length: 300 }, () => new ObjectId());
        const attIds = Array.from({ length: 200 }, () => new ObjectId());

        // --- A. CREAZIONE 100 LOGOPEDISTI (E 120 PREFERITI) ---
        const logopedisti = logoIds.map((id, index) => ({
            _id: id,
            pIva: String(10000000000 + index), // P.IVA univoca a 11 cifre
            nome: randomEl(nomi),
            cognome: randomEl(cognomi),
            email: `logopedista${index}@logspot.it`,
            password: 'password123',
            preferiti: []
        }));

        // Distribuiamo 120 attività preferite casualmente tra i logopedisti
        for (let i = 0; i < 120; i++) {
            const randomLogo = randomInt(0, 99);
            const randomAtt = randomInt(0, 199);
            logopedisti[randomLogo].preferiti.push({
                attivita: attIds[randomAtt],
                dataSalvataggio: new Date()
            });
        }
        await Logopedista.insertMany(logopedisti);
        console.log('✓ Inseriti 100 Logopedisti (con 120 preferiti assegnati)');

        // --- B. CREAZIONE 300 PAZIENTI ---
        const pazienti = pazIds.map((id, index) => ({
            _id: id,
            cf: `PZNTXX00X00X${String(index).padStart(4, '0')}`, // CF fittizio univoco
            nome: randomEl(nomi),
            cognome: randomEl(cognomi),
            email: `paziente${index}@example.com`,
            password: 'password123',
            logopedista: logoIds[randomInt(0, 99)] // Assegnato a un logopedista esistente
        }));
        await Paziente.insertMany(pazienti);
        console.log('✓ Inseriti 300 Pazienti');

        // --- C. CREAZIONE 200 ATTIVITÀ (E 250 COMMENTI) ---
        const attivita = attIds.map((id, index) => ({
            _id: id,
            titolo: `Esercizio Pratico ${index + 1}`,
            descrizione: 'Attività mirata al miglioramento fonetico.',
            patologie: [randomEl(patologieList)],
            accessibilita: Math.random() > 0.5,
            creatore: logoIds[randomInt(0, 99)], // Il logopedista che ha creato l'attività
            materiali: [{ tipo: 'testo', domanda: 'Ripeti ad alta voce la seguente frase.' }],
            commenti: []
        }));

        // Distribuiamo 250 commenti casuali tra le attività
        for (let i = 0; i < 250; i++) {
            const randomAtt = randomInt(0, 199);
            attivita[randomAtt].commenti.push({
                logopedista: logoIds[randomInt(0, 99)], // Il logopedista che ha commentato
                messaggio: 'Ottimo materiale, l\'ho usato oggi in studio!',
                data: new Date()
            });
        }
        await Attivita.insertMany(attivita);
        console.log('✓ Inserite 200 Attività (con 250 commenti distribuiti)');

        // --- D. CREAZIONE 500 ESERCIZI (E 250 FEEDBACK) ---
        let feedbackDisponibili = 250;
        const stati = ['da-svolgere', 'in-corso', 'completato'];

        const esercizi = Array.from({ length: 500 }, () => {
            let feedback = undefined;
            
            // Aggiungiamo un feedback solo finché ne abbiamo a disposizione (esattamente 250)
            if (feedbackDisponibili > 0) {
                feedback = { 
                    messaggio: "Esercizio completato, ho avuto un po' di difficoltà sulla pronuncia.", 
                    data: new Date() 
                };
                feedbackDisponibili--;
            }

            return {
                dataAssegnazione: new Date(),
                statoCompletamento: randomEl(stati),
                durata: randomInt(15, 45), // tra 15 e 45 minuti
                attivita: attIds[randomInt(0, 199)],
                logopedista: logoIds[randomInt(0, 99)],
                paziente: pazIds[randomInt(0, 299)],
                feedback: feedback
            };
        });
        await Esercizio.insertMany(esercizi);
        console.log('✓ Inseriti 500 Esercizi (di cui 250 con feedback incorporato)');

        console.log('\n🎉 Inizializzazione del database LogSpot completata con successo!');
        process.exit(0);

    } catch (error) {
        console.error('✗ Errore durante l\'inizializzazione del database:', error);
        process.exit(1);
    }
}

initDB();