
import 'dotenv/config'; 
import express, { Application, Request, Response, NextFunction } from 'express';
import { MongoConnection } from './database';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

//IMPORTAMOS ENRUTADORES
import authRouter from './routes/AuthRoutes'; 
import eventRouter from './routes/EventRoutes'; 
import partituraRouter from './routes/PartituraRoutes';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT as string) || 3000;

// OBLIGATORIO PARA QUE LO QUE LE LLEGUE A THUNDER CLIENT SEA Json
app.use(express.json());

// ENCHUFAMOS LAS RUTAS AL CIRCUITO PRINCIPAL

app.use('/api/auth', authRouter);
app.use('/api/events', eventRouter); 
app.use('/api/partituras', partituraRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//MANEJADOR GLOBAL DE ERRORES 

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("[LOG DE ERROR ERVIL]:", err.message);
    res.status(500).json({ error: "Fallo interno del servidor" });
});

// ARRANQUE SEGURO DEL SERVIDOR

const startServer = async () => {
    try {
        await MongoConnection.connect();
    
        app.listen(PORT, () => {
            console.log(` Servidor de La Tropical corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("No se pudo arrancar la API debido a un fallo en la conexión:", error);
        process.exit(1); 
    }
};

startServer();