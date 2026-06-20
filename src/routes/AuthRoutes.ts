import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDao } from '../daos/UserDao';

const router = Router();
const userDao = new UserDao();

// POST: /register REGISTRO DE MÚSICOS 
router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // EXTRAEMOS LOS DATOS DEL BODY (JSON) QUE NOS ENVÍA EL FRONTEND
        const { name, email, phone, instrument, password } = req.body;

        // 1. VERIFICAMOS SI YA EXISTE UN USUARIO CON ESE EMAIL
        const usuarioExistente = await userDao.buscarPorEmail(email);
        if (usuarioExistente) {
            // 400 BAD REQUES: EL MÚSICO YA ESTÁ REGISTRADO, NO PODEMOS CREAR OTRO CON EL MISMO EMAIL
            res.status(400).json({ error: 'Ya existe un músico registrado con este correo' });
            return;
        }

        // 2. ENCRIPTAMOS CONTRASEÑA
        const saltRounds = 10;
        const passwordEncriptada = await bcrypt.hash(password, saltRounds);

        // 3. GUARDAMOS EL NUEVO USUARIO EN LA BASE DE DATOS (DAO)
        const nuevoUsuario = await userDao.guardarNuevo({
            name,
            email,
            phone,
            instrument,
            password: passwordEncriptada, // GUARDAMOS EL HASH, NO LA CONTRASEÑA EN TEXTO PLANO
            role: 'user' // POR DEFECTO 
        });

        // 4. RESPONDEMOS CON 201 CREATED Y NO 200 OK, YA QUE SE HA CREADO UN NUEVO RECURSO (USUARIO)
        res.status(201).json({ mensaje: 'Músico registrado con éxito', usuario: nuevoUsuario });

    } catch (error) {
        next(error); 
    }
});

// POST: /login INICIO DE SESIÓN DE MÚSICOS
router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // BUSCAMOS EL USUARIO POR EMAIL EN LA BASE DE DATOS
        const usuario = await userDao.buscarPorEmail(email);
        if (!usuario) {
            // 401 UNAUTHORIZED: EL USUARIO NO EXISTE, POR LO TANTO NO PODEMOS AUTENTICARLO
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        // 2. COMPARAMOS LA CONTRASEÑA ENVIADA CON LA ENCRIPTADA EN LA BASE DE DATOS
        const esPasswordValida = await bcrypt.compare(password, usuario.password);
        if (!esPasswordValida) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        // 3. GENERAMOS EL TOKEN JWT PARA EL USUARIO AUTENTICADO
        const secreto = process.env.JWT_SECRET as string;
        if (!secreto) throw new Error("Falta JWT_SECRET en el .env");

        const token = jwt.sign(
            { idUsuario: usuario._id, rol: usuario.role }, // PAYLOAD: ID DEL USUARIO Y SU ROL
            secreto,                                      // LA FIRMA SECRETA PARA GENERAR EL TOKEN
            { expiresIn: '8h' }                           // CADUCIDAD DEL TOKEN
        );

        // 4. DEVOLVEMOS EL TOKEN Y EL USUARIO AL FRONTEND, SIN LA CONTRASEÑA
        res.status(200).json({
            mensaje: 'Login exitoso',
            token: token,
            usuario: usuario
        });

    } catch (error) {
        next(error);
    }
});

export default router;