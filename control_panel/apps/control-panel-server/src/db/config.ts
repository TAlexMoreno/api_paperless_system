import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { seedCategoriaDocumento, seedTipoDocumento } from "./seeders.js";
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_CONTROL_PANEL_DB}`;
const db: NodePgDatabase = drizzle(DATABASE_URL);
seedCategoriaDocumento(db).then(() => seedTipoDocumento(db));
    
export { db };