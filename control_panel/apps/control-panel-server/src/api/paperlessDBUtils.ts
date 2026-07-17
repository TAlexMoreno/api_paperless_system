import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm/sql";
import { APIError } from './apiError';
import logger from "../libs/logger";
import { categoriaDocumento, expediente } from "../db/schema";

export default class PaperlessDBUtils {
    static async getNumeroExpedienteCustomFieldId(paperlessDB: NodePgDatabase): Promise<{id: number, name: string}> {
        const customFieldName = "Número de Expediente";
        let numeroExpedienteCustomField = await paperlessDB.execute(sql`SELECT * FROM documents_customfield dc WHERE dc."name" = ${customFieldName}`);
        if (numeroExpedienteCustomField.rowCount === 0) {
            throw new APIError("Número de Expediente custom field not found", 500);
        }
        let customField: any = numeroExpedienteCustomField.rows.at(0);
        return customField;
    }
    static async getExpedientes(paperlessDB: NodePgDatabase): Promise<{value_text: string, count: number}[]> {
        let customField = await this.getNumeroExpedienteCustomFieldId(paperlessDB);
        let expedientes = await paperlessDB.execute(sql`SELECT value_text, count(dcv.id) FROM documents_customfieldinstance dcv WHERE dcv."field_id" = ${customField.id} GROUP BY value_text`);
        return expedientes.rows as {value_text: string, count: number}[];
    }

    static async getOrphanedExpedientes(paperlessDB: NodePgDatabase, serverDB: NodePgDatabase): Promise<{value_text: string, count: number}[]> {
        let expedientesInServerDB = await serverDB.select().from(expediente).execute();
        let claves = expedientesInServerDB.map(exp => exp.clave);

        let customField = await this.getNumeroExpedienteCustomFieldId(paperlessDB);
        let expedientes = await paperlessDB.execute(sql`SELECT value_text, count(dcv.id) FROM documents_customfieldinstance dcv WHERE dcv."field_id" = ${customField.id} AND dcv.value_text NOT IN (${claves.map(clave => `'${clave}'`).join(",")}) GROUP BY value_text`);
        return expedientes.rows as {value_text: string, count: number}[];
    }
}