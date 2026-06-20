import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

//AMPLIAMOS LA INTERFACE DE AUTHREQUEST
export interface AuthRequest extends Request {
    usuario?: {
        idUsuario: string;
        rol: string;
    };
}

// 2. MIDDLEWARE PRINCIPAL 
export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // TOKENS EN LA CABECERA
    const authHeader = req.headers.authorization;

    // SI NO TIENE CABECERA O NO EMPIEZA POR BEARER LO ECHAMOS
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // DEVOLVEMOS 401 NO AUTORIZADO
        res.status(401).json({ error: 'Acceso denegado. No has enviado un token válido.' });
        return;
    }
    //CORTAMOS EL TEXTO POR EL ESPACIO Y ONS QUEDAMOS CON LA SEGUNDA PARTE DEL TOKEN
    const token = authHeader.split(' ')[1];

    try {
        const secreto = process.env.JWT_SECRET as string;
        
        // JWT.VERIFY COMPRUEBA QUE LA FIRMA ES CORRECTA Y NO HA CADUCADO
       
        const payload = jwt.verify(token, secreto) as { idUsuario: string, rol: string };

        // PEGAMOS LOS DATOS DESCIFRADOS EN LA PETICIÓN
        req.usuario = payload;

        next();
    } catch (error) {
        // SI EL TOKEN ES FALSO VOLVEMOS AL LOGIN
        res.status(401).json({ error: 'Token inválido o caducado. Vuelve a iniciar sesión.' });
        return;
    }
};

// 3. MIDDLEWARE DE ROL
export const soloAdmins = (req: AuthRequest, res: Response, next: NextFunction): void => {
    
    if (req.usuario && req.usuario.rol === 'admin') {
        next(); 
    } else {
        // SI EL ROL NO ES ADMIN, FORBIDDEN
        res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }
};