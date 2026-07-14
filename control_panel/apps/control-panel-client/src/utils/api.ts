export type apiState = "unauthenticated" | "authenticated"
export default class ApiState {
    static readonly loginEndpoint = "/api/login";
    static readonly profileEndpoint = "/api/profile";
    static readonly uiSettingsEndpoint = "/api/ui_settings";

    private static instance: ApiState;

    status: apiState = "unauthenticated";

    private constructor() {}

    static getInstance() {
        if (!ApiState.instance) {
            ApiState.instance = new ApiState();
        }

        return ApiState.instance;
    }

    async login(data: { username: string; password: string }) {
        const response = await fetch(ApiState.loginEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            credentials: "include"
        });

        if (!response.ok) {
            console.log("Login failed with status:", response.status);
            throw new Error("Login failed");
        }

        this.status = "authenticated";
    }

    async get<T>(endpoint: URL): Promise<T> {
        const response = await fetch(endpoint.toString(), {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            console.log("GET request failed with status:", response.status);
            throw new Error("GET request failed");
        }

        return response.json() as Promise<T>;
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            credentials: "include"
        });

        if (!response.ok) {
            console.log("POST request failed with status:", response.status);
            throw new Error("POST request failed");
        }

        return response.json() as Promise<T>;
    }
}