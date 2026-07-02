import mongoose from 'mongoose';

const EsercizioSchema = new mongoose.Schema({
    dataAssegnazione: { type: Date, required: true },
    
    
    statoCompletamento: { type: String},
    durata: { type: Number }, // In secondi o minuti
    esito: { type: String },
    
    // Chiavi esterne verso le altre entità
    attivita: { type: mongoose.Schema.Types.ObjectId, ref: 'Attivita', required: true },
    logopedista: { type: mongoose.Schema.Types.ObjectId, ref: 'Logopedista', required: true },
    paziente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paziente', required: true },

    // Incorporiamo la tabella FEEDBACK (Relazione 1:1)
    feedback: {
        messaggio: { type: String },
        data: { type: Date, default: Date.now }
    }
});

export default mongoose.models.Esercizio || mongoose.model('Esercizio', EsercizioSchema);