import User, { IUser } from '../models/User';

export class UserDao {
    
    // COMPROBAMOS SI EL CORREO YA EXISTE
    public async buscarPorEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email: email });
    }

    // BUSCA POR IDENTIFICADRO JWT
    public async buscarPorId(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    // CUARDAR NUEVO MÚSICO EN LA BANDA
    public async guardarNuevo(datosUsuario: Partial<IUser>): Promise<IUser> { // EL PARTIAL HACE QUE TODOS LOS "CAMPOS" DEL MODELO SEAN OPCIONALES
        const nuevoUsuario = new User(datosUsuario);
        return await nuevoUsuario.save(); // EL SAVE TE APLICA LAS REGLAS AUTOMÁTICAMENTE. COMO EN LARAVEL...
    }
    
    // METODO PARA LISTAR TODA LA PLANTILLA
    public async obtenerTodos(): Promise<IUser[]> {
        return await User.find();
    }

}