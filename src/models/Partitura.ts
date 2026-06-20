import mongoose, { Schema, Document } from 'mongoose';

// INTERFAZ DE LA PARTITURA (CONTRATO TYPESCRIPT)
export interface IPartitura extends Document {
    title: string;
    composer: string;
    instrument: string;
    difficulty: number;
    pdf_url?: string;
}

// ESQUEMA MONGOOSE (REGLAS ESTRICTAS DE LA BASE DE DATOS)
const PartituraSchema: Schema = new Schema({
    title: { 
        type: String, 
        required: [true, 'EL TÍTULO ES OBLIGATORIO'], 
        trim: true 
    },
    composer: { 
        type: String, 
        required: [true, 'EL AUTOR O ARREGLISTA ES OBLIGATORIO'], 
        trim: true 
    },
    instrument: { 
        type: String, 
        required: [true, 'EL INSTRUMENTO ES OBLIGATORIO'],
        trim: true 
    },
    difficulty: { 
        type: Number, 
        required: true,
        min: [1, 'LA DIFICULTAD MÍNIMA ES 1'],
        max: [5, 'LA DIFICULTAD MÁXIMA ES 5'] 
    },
    pdf_url: { 
        type: String, 
        trim: true 
    }
}, { 
    timestamps: true 
});

export default mongoose.model<IPartitura>('Partitura', PartituraSchema);