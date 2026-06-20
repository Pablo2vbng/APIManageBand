import mongoose, { Schema, Document } from 'mongoose';

// 1. DEFINIMOS LA INTERFAZ
export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;      //? OPCIONAL
    instrument?: string; 
    role: 'admin' | 'user'; // TIENE UN ENUM
    password: string;    // HASH DE BCRYPT
}

// 2. DEFINIMOS EL SCHEMA MONGOSSE 
const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre completo es obligatorio'],
        trim: true // PARA ELIMINAR LOS ESPACIOS DELANTE Y DETRÁS
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true, // PARA NO REPETIR EMAILS
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'El formato del correo electrónico no es válido'] // REGEX EN EL ESQUEMA
    },
    phone: {
        type: String,
        required: false
    },
    instrument: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'user'],
            message: '{VALUE} no es un rol válido en La Tropical'
        },
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    }
}, {
    timestamps: true // CREA CREATED AT Y UPDATED AT COMO EN LARAVEL
});

// 3. SEGURIDAD
UserSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password; // ANTES DE QUE EXPRESS ENVIE EL USUSARIO AL CIENTE BORRAMOS POR SEGURIDAD
    return obj;
};

// 4. EXPORTAMOS EL MODELO
export default mongoose.model<IUser>('User', UserSchema);