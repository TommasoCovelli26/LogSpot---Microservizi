import mongoose from 'mongoose';

// Sotto-schema per inglobare la tabella MATERIALE
const MaterialeSchema = new mongoose.Schema({
    tipo: { type: String },
    immagine: { type: String },
    domanda: { type: String },
    risposta: { type: String },
    rispFalsa: { type: String }
});

// Sotto-schema per inglobare la tabella COMMENTO
const CommentoSchema = new mongoose.Schema({
    logopedista: { type: mongoose.Schema.Types.ObjectId, ref: 'Logopedista', required: true },
    messaggio: { type: String },
    data: { type: Date, default: Date.now }
});

const AttivitaSchema = new mongoose.Schema({
    dataCreazione: { type: Date, default: Date.now },
    titolo: { type: String, required: true },
    descrizione: { type: String },
    istruzioni: { type: String },
    
    // Al posto di una stringa con il delimitatore "|", in MongoDB usiamo un array pulito!
    immagini: [{ type: String }], 
    
    accessibilita: { type: Boolean, default: false }, // false = privata, true = pubblica
    fasciaEta: { type: Number, default: 0 },
    
    // Al posto di una stringa separata da virgole, usiamo un array di stringhe
    patologie: [{ type: String }],
    
    // Riferimento al creatore
    creatore: { type: mongoose.Schema.Types.ObjectId, ref: 'Logopedista', required: true },

    // Incorporiamo i Materiali e i Commenti
    materiali: [MaterialeSchema],
    commenti: [CommentoSchema]
});

export default mongoose.models.Attivita || mongoose.model('Attivita', AttivitaSchema);