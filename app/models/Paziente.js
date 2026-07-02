import mongoose from 'mongoose';

const PazienteSchema = new mongoose.Schema({
    cf: { type: String, required: true, unique: true, maxlength: 16 },
    cognome: { type: String, required: true },
    nome: { type: String, required: true },
    dataNascita: { type: Date },
    numTelefono: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // FOREIGN KEY id_logopedista
    logopedista: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Logopedista',
        default: null 
    }
});

export default mongoose.models.Paziente || mongoose.model('Paziente', PazienteSchema);