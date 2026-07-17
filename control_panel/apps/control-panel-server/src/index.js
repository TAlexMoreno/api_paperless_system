import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectToDatabase from './db/config';
import { APIError } from './api/apiError';
import { SecurityRoute } from './routes/security';
import { ApiRoute } from './routes/api.js';
import PaperlessBridgeRoute from './routes/paperless';
import cookieParser from 'cookie-parser';
import logger from './libs/logger';
process.on('uncaughtException', (err) => {
    logger.error(err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Promise Rejection detected!');
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = await connectToDatabase();
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
new SecurityRoute(app);
new PaperlessBridgeRoute(app, db);
new ApiRoute(app, db);
app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((err, req, res, next) => {
    if (err instanceof APIError) {
        return res.status(err.responseCode).json(err.responseObject);
    }
    next(err);
});
app.listen(8000, () => logger.info('Server is running on port 8000'));
