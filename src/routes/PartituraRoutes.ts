import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { PartituraDao } from '../daos/PartituraDao';
import { verificarToken, soloAdmins, AuthRequest } from '../middlewares/jwtMiddleware';

const router = Router();
const partituraDao = new PartituraDao();

// GET: VER TODO EL ARCHIVO MUSICAL (CUALQUIER MÚSICO AUTENTICADO)
router.get('/', verificarToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const partituras = await partituraDao.obtenerTodas();
        res.status(200).json(partituras);
    } catch (error) {
        next(error);
    }
});

// GET: VER DETALLES DE UNA PARTITURA (CUALQUIER MÚSICO AUTENTICADO)
router.get('/:id', verificarToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // VALIDAR FORMATO DEL ID PARA EVITAR ERRORES DE MONGOOSE
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            res.status(400).json({ error: 'EL ID DE LA PARTITURA NO ES VÁLIDO' });
            return;
        }

        const idStr = req.params.id as string;
        const partitura = await partituraDao.buscarPorId(idStr);
        
        if (!partitura) {
            res.status(404).json({ error: 'PARTITURA NO ENCONTRADA EN EL ARCHIVO' });
            return;
        }

        res.status(200).json(partitura);
    } catch (error) {
        next(error);
    }
});

// POST: SUBIR NUEVA PARTITURA AL ARCHIVO (SOLO ADMINS)
router.post('/', verificarToken, soloAdmins, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const nueva = await partituraDao.guardarNueva(req.body);
        res.status(201).json({ mensaje: 'PARTITURA AÑADIDA AL ARCHIVO CON ÉXITO', partitura: nueva });
    } catch (error) {
        next(error);
    }
});

// PUT: EDITAR DATOS DE LA PARTITURA (SOLO ADMINS)
router.put('/:id', verificarToken, soloAdmins, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // VALIDAR FORMATO DEL ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            res.status(400).json({ error: 'EL ID DE LA PARTITURA NO ES VÁLIDO' });
            return;
        }

        const idStr = req.params.id as string;
        const actualizada = await partituraDao.actualizar(idStr, req.body);

        if (!actualizada) {
            res.status(404).json({ error: 'PARTITURA NO ENCONTRADA PARA EDITAR' });
            return;
        }

        res.status(200).json({ mensaje: 'PARTITURA ACTUALIZADA CORRECTAMENTE', partitura: actualizada });
    } catch (error) {
        next(error);
    }
});

// DELETE: BORRAR PARTITURA DEL ARCHIVO (SOLO ADMINS)
router.delete('/:id', verificarToken, soloAdmins, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // VALIDAR FORMATO DEL ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            res.status(400).json({ error: 'EL ID DE LA PARTITURA NO ES VÁLIDO' });
            return;
        }

        const idStr = req.params.id as string;
        const borrada = await partituraDao.borrar(idStr);

        if (!borrada) {
            res.status(404).json({ error: 'PARTITURA NO ENCONTRADA PARA BORRAR' });
            return;
        }

        res.status(200).json({ mensaje: 'PARTITURA ELIMINADA DEFINITIVAMENTE DEL ARCHIVO' });
    } catch (error) {
        next(error);
    }
});

export default router;