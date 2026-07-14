import { ApiPaperlessError } from "../../api/apiError.ts";
import { ApiPaperlessCollection, DocumentType, plessLoginResponse, plessProfile, plessUISettings } from "../../../../../packages/paperless/types.ts";
import { NodePgDatabase } from "drizzle-orm/node-postgres/driver";
import { tipoDocumento } from "../../db/schema.ts";
import logger from "../logger.ts";



export default class PaperlessConnector {
    static readonly documentTypeEp = "document_types/";
    static getURL(endpoint: string): URL {
        return new URL(`http://localhost:${process.env.PAPERLESS_PORT}/api/${endpoint}`);
    }

    static async login(username: string, password: string): Promise<plessLoginResponse> {
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

        const data: plessLoginResponse = await response.json();
        return data;
    }

    constructor(private token: string) {}
    
    async getProfile(): Promise<plessProfile> {
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

        const data: plessProfile = await response.json();
        return data;
    }

    async getUiSettings(): Promise<plessUISettings> {
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

        const data: plessUISettings = await response.json();
        return data;
    }

    async syncDocumentTypes(db: NodePgDatabase): Promise<void> {
        let tipos = await db.select().from(tipoDocumento);
        let url = PaperlessConnector.getURL(PaperlessConnector.documentTypeEp);
        for (const tipo of tipos) {
            logger.debug(`🔄 Syncing document type: ${tipo.nombre}`);
            url.searchParams.set('name__iexact', tipo.nombre);
            const tiposSearch = await this.getCollection<DocumentType>(url);
            if (tiposSearch.count === 0) {
                logger.debug(`📄 Document type "${tipo.nombre}" not found in Paperless. Creating...`);
                let newTipo = await this.postData<DocumentType>(PaperlessConnector.getURL(PaperlessConnector.documentTypeEp), { 
                    name: tipo.nombre.slice(0, 128),
                });
            }else if (tiposSearch.count === 1) {
                logger.debug(`✅ Document type "${tipo.nombre}" already exists in Paperless.`);
            }else if (tiposSearch.count > 1) {
                logger.warn(`⚠️ Multiple document types found for "${tipo.nombre}". Skipping creation.`);
            }else {
                logger.error(`❌ Unexpected response while searching for document type "${tipo.nombre}".`);
                break;
            }
        }
    }

    async getCollection<T>(endpoint: URL): Promise<ApiPaperlessCollection<T>> {
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
        let data: ApiPaperlessCollection<T>;
        try {
            data = JSON.parse(textResponse);
        } catch (error) {
            throw new ApiPaperlessError(`Failed to parse JSON response: ${textResponse}`, response.status, endpoint.toString());
        }
        
        return data;
    }

    async postData<T>(endpoint: URL, body: T): Promise<T> {
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

        const data: T = await response.json();
        return data;
    }
}
