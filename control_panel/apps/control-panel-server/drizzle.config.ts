import {defineConfig} from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.POSTGRES_HOST || "localhost",
        port: Number(process.env.POSTGRES_PORT) || 5432,
        user: process.env.POSTGRES_USER || "paperless",
        password: process.env.POSTGRES_PASSWORD || "paperless",
        database: process.env.POSTGRES_CONTROL_PANEL_DB || "control_panel",
        ssl: false,
    }
});