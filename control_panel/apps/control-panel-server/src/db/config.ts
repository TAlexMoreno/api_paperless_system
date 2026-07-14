import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { seedCategoriaDocumento, seedTipoDocumento } from "./seeders.js";
import dotenv from 'dotenv';
import logger from "../libs/logger.js";
import ping from "../libs/ping.js";

dotenv.config();

const POSTGRES_HOST = process.env.POSTGRES_HOST || "127.0.0.1";
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || "5432", 10);
const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${process.env.POSTGRES_CONTROL_PANEL_DB}`;
    
export default async function connectToDatabase(): Promise<NodePgDatabase> {
    logger.info(`Connecting to database at ${DATABASE_URL.replace(/(?<=:)[^:@]+(?=@)/, ':*****@')}`);
    const db: NodePgDatabase = drizzle(DATABASE_URL);
    let isReachable = await ping(POSTGRES_HOST, POSTGRES_PORT, 5000);
    if (!isReachable) {
        logger.error(`Database server unreachable. Not initializing server...`);
        process.exit(1);
    }
    try {
        logger.info(`Seeding database...`);
        // await seedCategoriaDocumento(db);
        // await seedTipoDocumento(db);
    } catch (error) {
        logger.error(`Database connection failed. Not initializing server...`);
        process.exit(1);
    }
    return db;
}