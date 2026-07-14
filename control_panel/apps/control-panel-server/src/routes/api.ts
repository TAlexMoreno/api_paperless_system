import express from 'express';
import APIRouter from '../api/apiRouter.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import PaperlessConnector from '../libs/paperless/connector.js';
import logger from '../libs/logger.js';
export class ApiRoute {
    constructor(app: express.Application, private db: NodePgDatabase) {
        app.get('/api/profile', this.checkUserLoggedIn.bind(this), this.getProfile.bind(this));
        app.get('/api/ui_settings', this.checkUserLoggedIn.bind(this), this.getUiSettings.bind(this));
        app.post('/api/paperless/sync_document_types', this.checkUserLoggedIn.bind(this), this.syncDocumentTypes.bind(this));
        app.get('/api/:entity/:id', this.checkUserLoggedIn.bind(this), this.handleGetItem.bind(this));
        app.get('/api/:entity', this.checkUserLoggedIn.bind(this), this.handleGetEntity.bind(this));
        app.post('/api/:entity/:id', this.checkUserLoggedIn.bind(this), this.handlePostItem.bind(this));
    }

    async handlePostItem(req: express.Request<{ entity: string; id: string }>, res: express.Response) {
        let apiRouter = new APIRouter(req, this.db);
        try {
            const updatedItem = await apiRouter.postItem(req.params.id, req.body);
            return res.status(200).json(updatedItem);
        } catch (error: any) {
            if (error.name === "EntityNotFoundError") {
                return res.status(404).json({ message: "Item not found" });
            }
            logger.error(error.message, error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async handleGetItem(req: express.Request<{ entity: string; id: string }>, res: express.Response) {
        let apiRouter = new APIRouter(req, this.db);
        try {
            const item = await apiRouter.getItem(req.params.id);
            return res.status(200).json(item);
        } catch (error: any) {
            if (error.name === "EntityNotFoundError") {
                return res.status(404).json({ message: "Item not found" });
            }
            logger.error(`Error fetching item for entity ${req.params.entity} with id ${req.params.id}:`, error);
            return res.status(500).json({ message: "Internal server error" });
        }
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
    async syncDocumentTypes(req: express.Request, res: express.Response) {
        let token = req.cookies?.paperless_token ?? null;
        let paperlessConnector = new PaperlessConnector(token);
        try {
            await paperlessConnector.syncDocumentTypes(this.db);
            return res.status(200).json({ message: "Document types synchronized successfully." });
        } catch (error: any) {
            return res.status(500).json(error.responseObject || { message: "An error occurred while synchronizing document types." });
        }
    }
}