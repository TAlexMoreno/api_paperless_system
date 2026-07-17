import { ApiPaperlessError } from "../../api/apiError";
import { tipoDocumento } from "../../db/schema";
import logger from "../logger";
import { eq } from "drizzle-orm";
export default class PaperlessConnector {
    token;
    static documentTypeEp = "document_types/";
    static getURL(endpoint) {
        return new URL(`http://localhost:${process.env.PAPERLESS_PORT}/api/${endpoint}`);
    }
    static async login(username, password) {
        const response = await fetch(PaperlessConnector.getURL('token/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiPaperlessError(`Login failed with status ${response.status}: ${errorText}`, response.status, PaperlessConnector.getURL('token/').toString());
        }
        const data = await response.json();
        return data;
    }
    constructor(token) {
        this.token = token;
    }
    async getProfile() {
        const response = await fetch(PaperlessConnector.getURL('profile/'), {
            method: 'GET',
            headers: {
                'Authorization': `Token ${this.token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiPaperlessError(`Failed to fetch profile with status ${response.status}: ${errorText}`, response.status, PaperlessConnector.getURL('profile/').toString());
        }
        const data = await response.json();
        return data;
    }
    async getUiSettings() {
        const response = await fetch(PaperlessConnector.getURL('ui_settings/'), {
            method: 'GET',
            headers: {
                'Authorization': `Token ${this.token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiPaperlessError(`Failed to fetch UI settings with status ${response.status}: ${errorText}`, response.status, PaperlessConnector.getURL('ui_settings/').toString());
        }
        const data = await response.json();
        return data;
    }
    async syncDocumentTypes(db) {
        let tipos = await db.select().from(tipoDocumento);
        let url = PaperlessConnector.getURL(PaperlessConnector.documentTypeEp);
        for (const tipo of tipos) {
            url.searchParams.set('name__iexact', tipo.nombre);
            const tiposSearch = await this.getCollection(url);
            if (tiposSearch.count === 0) {
                logger.debug(`📄 Document type "${tipo.nombre}" not found in Paperless. Creating...`);
                let newTipo = await this.postData(PaperlessConnector.getURL(PaperlessConnector.documentTypeEp), {
                    name: tipo.nombre.slice(0, 128),
                    matching_algorithm: 6,
                });
                tipo.paperlessId = newTipo.id;
                let update = await db.update(tipoDocumento).set({ paperlessId: newTipo.id }).where(eq(tipoDocumento.id, tipo.id)).execute();
                logger.debug(`💾 Document type "${tipo.nombre}" created in Paperless with ID ${newTipo.id}`);
            }
            else if (tiposSearch.count === 1) {
                let existingTipo = tiposSearch.results[0];
                if (existingTipo && existingTipo.id) {
                    tipo.paperlessId = existingTipo.id;
                    let update = await db.update(tipoDocumento).set({ paperlessId: existingTipo.id }).where(eq(tipoDocumento.id, tipo.id)).execute();
                }
                logger.debug(`✅ Document type "${tipo.nombre}" already exists in Paperless`);
            }
            else if (tiposSearch.count > 1) {
                logger.warn(`⚠️ Multiple document types found for "${tipo.nombre}". Skipping creation.`);
            }
            else {
                logger.error(`❌ Unexpected response while searching for document type "${tipo.nombre}".`);
                break;
            }
        }
    }
    async getCollection(endpoint) {
        logger.debug(`GET ${endpoint}`);
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiPaperlessError(`Failed to fetch collection with status ${response.status}: ${errorText}`, response.status, endpoint.toString());
        }
        let textResponse = await response.text();
        let data;
        try {
            data = JSON.parse(textResponse);
        }
        catch (error) {
            throw new ApiPaperlessError(`Failed to parse JSON response: ${textResponse}`, response.status, endpoint.toString());
        }
        return data;
    }
    async postData(endpoint, body) {
        logger.debug(`Posting data to Paperless API: ${endpoint} with body: ${JSON.stringify(body)}`);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiPaperlessError(`Failed to post data with status ${response.status}: ${errorText}`, response.status, endpoint.toString());
        }
        const data = await response.json();
        return data;
    }
}
