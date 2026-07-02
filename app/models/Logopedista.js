import mongoose from 'mongoose';

const LogopedistaSchema = new mongoose.Schema({
    pIva: { type: String, required: true, unique: true, maxlength: 11 },
    cognome: { type: String, required: true },
    nome: { type: String, required: true },
    dataNascita: { type: Date },
    numTelefono: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Incorporiamo la tabella PREFERITI (Relazione N:N con Attività)
    preferiti: [{
        attivita: { type: mongoose.Schema.Types.ObjectId, ref: 'Attivita', required: true },
        dataSalvataggio: { type: Date, default: Date.now }
    }]
});

export default mongoose.models.Logopedista || mongoose.model('Logopedista', LogopedistaSchema);