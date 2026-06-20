import Partitura, { IPartitura } from '../models/Partitura';

export class PartituraDao {
    
    // LEER TODAS LAS PARTITURAS DEL ARCHIVO (GET)
    public async obtenerTodas(): Promise<IPartitura[]> {
        // ORDENAMOS ALFABÉTICAMENTE POR EL TÍTULO
        return await Partitura.find().sort({ title: 1 });
    }

    // LEER UNA PARTITURA CONCRETA POR SU ID (GET)
    public async buscarPorId(id: string): Promise<IPartitura | null> {
        return await Partitura.findById(id);
    }

    // CREAR UNA NUEVA PARTITURA (POST)
    public async guardarNueva(datos: Partial<IPartitura>): Promise<IPartitura> {
        const nueva = new Partitura(datos);
        return await nueva.save();
    }

    // EDITAR UNA PARTITURA EXISTENTE (PUT)
    public async actualizar(id: string, datosNuevos: Partial<IPartitura>): Promise<IPartitura | null> {
        return await Partitura.findByIdAndUpdate(
            id, 
            datosNuevos, 
            { new: true, runValidators: true } // RUNVALIDATORS ASEGURA QUE SE CUMPLAN LAS REGLAS DEL ESQUEMA AL EDITAR
        );
    }

    // BORRAR UNA PARTITURA PERMANENTEMENTE (DELETE)
    public async borrar(id: string): Promise<IPartitura | null> {
        return await Partitura.findByIdAndDelete(id);
    }
}