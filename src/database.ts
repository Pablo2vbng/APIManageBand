import 'dotenv/config'; // LEE EL ARCHIVO ENV
import mongoose from 'mongoose';

export class MongoConnection {
    public static async connect(): Promise<void> {
        try {
            // URI DEL ARCHIVO ENV
            const uri = process.env.MONGO_URI as string;
            
            if (!uri) {
                throw new Error(" No MONGO_URI en el archivo .env");
            }

            await mongoose.connect(uri);
            console.log('Conectado a MongoDB Atlas (La Tropical DB)');
        } catch (error) {
            console.error('No se pudo conectar a la base de datos:', error);
            // Esto mata el servidor si la base de datos no funciona
            process.exit(1); 
        }
    }
}