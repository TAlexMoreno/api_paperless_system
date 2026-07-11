import express from 'express';
import APIRouter from '../api/apiRouter.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import PaperlessConnector from '../libs/paperless/connector.js';
export class ApiRoute {
    constructor(app: express.Application, private db: NodePgDatabase) {
        app.get('/api/profile', this.checkUserLoggedIn.bind(this), this.getProfile.bind(this));
        app.get('/api/ui_settings', this.checkUserLoggedIn.bind(this), this.getUiSettings.bind(this));
        app.get('/api/:entity', this.checkUserLoggedIn.bind(this), this.handleGetEntity.bind(this));
    }

    async handleGetEntity(req: express.Request<{ entity: string }>, res: express.Response) {
        let apiRouter = new APIRouter(req, this.db);
        const collection = await apiRouter.getCollection();
        return res.status(200).json(collection);
    }

    async checkUserLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
        const token = req.cookies?.paperless_token ?? null;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let paperlessConnector = new PaperlessConnector(token);
        try {
            await paperlessConnector.getProfile();
        } catch (error: any) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        next();
    }

    async getProfile(req: express.Request, res: express.Response) {
        let token = req.cookies?.paperless_token ?? null;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let paperlessConnector = new PaperlessConnector(token);
        try {
            const profile = await paperlessConnector.getProfile();
            return res.status(200).json(profile);
        } catch (error: any) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }

    async getUiSettings(req: express.Request, res: express.Response) {
        let token = req.cookies?.paperless_token ?? null;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let paperlessConnector = new PaperlessConnector(token);
        try {
            const uiSettings = await paperlessConnector.getUiSettings();
            return res.status(200).json(uiSettings);
        } catch (error: any) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }
}