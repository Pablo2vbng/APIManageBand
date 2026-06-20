import mongoose, { Schema, Document, Types } from 'mongoose';

// 1. INTERFAZ DEL CONVOCADO  
export interface IConvocado {
    userId: Types.ObjectId;  
    has_car: boolean;       
    price_modifier: number; 
}

// 2. INTERFAZ DEL EVENTO 
export interface IEvent extends Document {
    title: string;
    description?: string;
    date: Date;
    is_paid: boolean;
    base_price: number;
    meeting_time_sede?: string;
    convocados: IConvocado[]; // ARRAY DE CONVOCADOS
}

// 3.SCHEMA DE MONGOOSE PARA EL EVENTO
const EventSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'El título del evento es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'La fecha y hora del evento es obligatoria']
    },
    is_paid: {
        type: Boolean,
        default: false 
    },
    base_price: {
        type: Number,
        default: 0,
        min: [0, 'El precio base no puede ser negativo']
    },
    meeting_time_sede: {
        type: String, // Ejemplo: "17:30"
        trim: true
    },
    // AQUI INCRUSTAMOS EL SUBDOCUMENTO DE CONVOCADOS
    convocados: [{
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', // ID PERTENECIENTE A LA COLECCIÓN DE USUARIOS
            required: true 
        },
        has_car: { 
            type: Boolean, 
            default: false 
        },
        price_modifier: { 
            type: Number, 
            default: 0 
        }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IEvent>('Event', EventSchema);