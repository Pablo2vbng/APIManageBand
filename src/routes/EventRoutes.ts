import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose'; 
import { EventDao } from '../daos/EventDao';
import { verificarToken, soloAdmins, AuthRequest } from '../middlewares/jwtMiddleware';

const router = Router();
const eventDao = new EventDao();

// GET: OBTENER TODOS LOS EVENTOS (SOLO MÚSICOS LOGUEADOS)
router.get('/', verificarToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const eventos = await eventDao.obtenerTodos();
        res.status(200).json(eventos);
    } catch (error) {
        next(error);
    }
});

// GET: OBTENER UN EVENTO POR ID CON EL PRESUPUESTO CALCULADO
router.get('/:id', verificarToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // VALIDAR QUE EL ID TIENE FORMATO CORRECTO DE MONGO
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            res.status(400).json({ error: 'EL ID DEL EVENTO NO ES VÁLIDO' });
            return;
        }

        const idEventoStr = req.params.id as string;
        const evento = await eventDao.buscarPorId(idEventoStr);
        
        if (!evento) {
            res.status(404).json({ error: 'EVENTO NO ENCONTRADO' });
            return;
        }

        // CÁLCULO DEL PRESUPUESTO SUMANDO PRECIO BASE Y PLUSES DE LOS MÚSICOS
        let costeTotal = 0;
        const precioBase = evento.base_price;

        evento.convocados.forEach(musico => {
            costeTotal += (precioBase + musico.price_modifier);
        });

        // DEVOLVEMOS EL EVENTO Y EL CÁLCULO MATEMÁTICO INYECTADO
        res.status(200).json({
            evento: evento,
            estadisticas: {
                total_musicos_apuntados: evento.convocados.length,
                presupuesto_charanga: costeTotal
            }
        });

    } catch (error) {
        next(error);
    }
});

// POST: CREAR UN NUEVO EVENTO (SOLO ADMINS)
router.post('/', verificarToken, soloAdmins, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const nuevoEvento = await eventDao.guardarNuevo(req.body);
        res.status(201).json({ mensaje: 'BOLO CREADO CON ÉXITO', evento: nuevoEvento });
    } catch (error) {
        next(error);
    }
});

// PUT: EDITAR UN EVENTO EXISTENTE (SOLO ADMINS)
router.put('/:id', verificarToken, soloAdmins, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // VALIDAR FORMATO DEL ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            res.status(400).json({ error: 'EL ID DEL EVENTO NO ES VÁLIDO' });
            return;
        }

        const idEvento = req.params.id as string;
        // PASAMOS EL ID Y LOS DATOS NUEVOS DEL BODY AL DAO
        const eventoActualizado = await eventDao.actualizar(idEvento, req.body);

        if (!eventoActualizado) {
            res.status(404).json({ error: 'EVENTO NO ENCONTRADO PARA EDITAR' });
            return;
        }

        res.status(200).json({ mensaje: 'BOLO ACTUALIZADO CORRECTAMENTE', evento: eventoActualizado });
    } catch (error) {
        next(error);
    }
});

// DELETE: BORRAR UN EVENTO DE LA AGENDA (SOLO ADMINS)
router.delete('/:id', verificarToken, soloAdmins, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // VALIDAR FORMATO DEL ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            res.status(400).json({ error: 'EL ID DEL EVENTO NO ES VÁLIDO' });
            return;
        }

        const idEvento = req.params.id as string;
        const eventoBorrado = await eventDao.borrar(idEvento);

        if (!eventoBorrado) {
            res.status(404).json({ error: 'EVENTO NO ENCONTRADO PARA BORRAR' });
            return;
        }

        res.status(200).json({ mensaje: 'BOLO ELIMINADO PERMANENTEMENTE DE LA AGENDA' });
    } catch (error) {
        next(error);
    }
});

// POST: APUNTARSE A UN EVENTO (CUALQUIER MÚSICO LOGUEADO)
router.post('/:id/apuntar', verificarToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // VALIDAR FORMATO DEL ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            res.status(400).json({ error: 'EL ID DEL EVENTO NO ES VÁLIDO' });
            return;
        }

        const idEvento = req.params.id as string;
        // SACAMOS EL ID DEL MÚSICO DE LA LIBRETA DEL PORTERO (TOKEN)
        const idUsuario = String(req.usuario!.idUsuario); 
        const llevaCoche = req.body.has_car || false;

        // COMPROBAR QUE NO SE APUNTE DOS VECES
        const yaApuntado = await eventDao.comprobarSiEstaApuntado(idEvento, idUsuario);
        if (yaApuntado) {
            res.status(400).json({ error: 'YA ESTÁS APUNTADO A ESTE EVENTO' });
            return;
        }

        const eventoActualizado = await eventDao.apuntarMusico(idEvento, idUsuario, llevaCoche);
        
        if (!eventoActualizado) {
            res.status(404).json({ error: 'EL EVENTO NO EXISTE' });
            return;
        }

        res.status(200).json({ mensaje: 'TE HAS APUNTADO A LA CHARANGA CON ÉXITO' });

    } catch (error) {
        next(error);
    }
});

export default router;