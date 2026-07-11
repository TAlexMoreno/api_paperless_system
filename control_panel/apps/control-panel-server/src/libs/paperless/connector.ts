import { ApiPaperlessError } from "../../api/apiError.ts";
import { plessLoginResponse, plessProfile, plessUISettings } from "../../../../../packages/paperless/types.ts";



export default class PaperlessConnector {
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
}