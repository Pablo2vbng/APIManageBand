import Event, { IEvent } from '../models/Event';
import { Types } from 'mongoose';

export class EventDao {
    
    // OBTENER TODOS LOS EVENTOS ORDENADOS POR FECHA
    public async obtenerTodos(): Promise<IEvent[]> {
        return await Event.find().sort({ date: 1 });
    }

    // BUSCAR UN EVENTO Y CRUZAR DATOS (POPULATE) PARA VER NOMBRES
    public async buscarPorId(id: string): Promise<IEvent | null> {
        const event = await Event.findById(id);
        if (event) {
            await event.populate('convocados.userId', 'name email instrument'); 
        }
        return event;
    }

    // CREAR UN EVENTO NUEVO
    public async guardarNuevo(datosEvento: Partial<IEvent>): Promise<IEvent> {
        const nuevoEvento = new Event(datosEvento);
        return await nuevoEvento.save();
    }

    // ACTUALIZAR EVENTO (PUT). RUNVALIDATORS EVITA QUE METAN DATOS FALSOS AL EDITAR
    public async actualizar(id: string, datosNuevos: Partial<IEvent>): Promise<IEvent | null> {
        return await Event.findByIdAndUpdate(
            id, 
            datosNuevos, 
            { new: true, runValidators: true }
        );
    }

    // BORRAR EVENTO PERMANENTEMENTE (DELETE)
    public async borrar(id: string): Promise<IEvent | null> {
        return await Event.findByIdAndDelete(id);
    }

    // INYECTAR UN MÚSICO AL EVENTO SIN BORRAR A LOS DEMÁS ($PUSH)
    public async apuntarMusico(idEvento: string, idUsuario: string, llevaCoche: boolean): Promise<IEvent | null> {
        return await Event.findByIdAndUpdate(
            idEvento,
            {
                $push: {
                    convocados: {
                        userId: new Types.ObjectId(idUsuario),
                        has_car: llevaCoche,
                        price_modifier: 0 
                    }
                }
            },
            { new: true, runValidators: true }
        );
    }

    // COMPROBAR SI EL MÚSICO YA ESTÁ EN EL EVENTO PARA NO REPETIRLO
    public async comprobarSiEstaApuntado(idEvento: string, idUsuario: string): Promise<boolean> {
        const evento = await Event.findOne({
            _id: idEvento,
            "convocados.userId": idUsuario
        });
        return evento !== null; 
    }
}