import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db/config.js';
import { APIError } from './api/apiError.js';
import { SecurityRoute } from './routes/security.js';
import { ApiRoute } from './routes/api.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' })
});

new SecurityRoute(app);
new ApiRoute(app, db);

app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof APIError) {
    return res.status(err.responseCode).json(err.responseObject);
  }
  next(err);
});

app.listen(8000, () => console.log('Server is running on port 8000'));