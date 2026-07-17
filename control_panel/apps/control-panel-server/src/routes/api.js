import APIRouter from '../api/apiRouter.js';
import PaperlessConnector from '../libs/paperless/connector.js';
import logger from '../libs/logger.js';
import connectToPaperlessDatabase from '../db/paperless_config.js';
import PaperlessDBUtils from '../api/paperlessDBUtils.js';
export class ApiRoute {
    db;
    constructor(app, db) {
        this.db = db;
        app.get('/api/expedientes/orphaned', ApiRoute.checkUserLoggedIn.bind(this), this.handleOrphaned.bind(this));
        app.get('/api/profile', ApiRoute.checkUserLoggedIn.bind(this), this.getProfile.bind(this));
        app.get('/api/ui_settings', ApiRoute.checkUserLoggedIn.bind(this), this.getUiSettings.bind(this));
        app.get('/api/:entity/:id', ApiRoute.checkUserLoggedIn.bind(this), this.handleGetItem.bind(this));
        app.get('/api/:entity', ApiRoute.checkUserLoggedIn.bind(this), this.handleGetEntity.bind(this));
        app.post('/api/:entity/:id', ApiRoute.checkUserLoggedIn.bind(this), this.handlePostItem.bind(this));
    }
    async handleOrphaned(req, res) {
        let db = await connectToPaperlessDatabase();
        let paperlessExp = await PaperlessDBUtils.getOrphanedExpedientes(db, this.db);
        res.status(200).json({
            "@id": "/api/expedientes/orphaned",
            "@type": "Collection",
            "totalItems": paperlessExp.length,
            "member": paperlessExp
        });
    }
    async handlePostItem(req, res) {
        let apiRouter = new APIRouter(req, this.db);
        try {
            const updatedItem = await apiRouter.postItem(req.params.id, req.body);
            return res.status(200).json(updatedItem);
        }
        catch (error) {
            if (error.name === "EntityNotFoundError") {
                return res.status(404).json({ message: "Item not found" });
            }
            logger.error(error.message, error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    async handleGetItem(req, res) {
        let apiRouter = new APIRouter(req, this.db);
        try {
            const item = await apiRouter.getItem(req.params.id);
            return res.status(200).json(item);
        }
        catch (error) {
            if (error.name === "EntityNotFoundError") {
                return res.status(404).json({ message: "Item not found" });
            }
            logger.error(`Error fetching item for entity ${req.params.entity} with id ${req.params.id}:`, error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    async handleGetEntity(req, res) {
        let apiRouter = new APIRouter(req, this.db);
        const collection = await apiRouter.getCollection();
        return res.status(200).json(collection);
    }
    static async checkUserLoggedIn(req, res, next) {
        const token = req.cookies?.paperless_token ?? null;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let paperlessConnector = new PaperlessConnector(token);
        try {
            await paperlessConnector.getProfile();
        }
        catch (error) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    }
    async getProfile(req, res) {
        let token = req.cookies?.paperless_token ?? null;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let paperlessConnector = new PaperlessConnector(token);
        try {
            const profile = await paperlessConnector.getProfile();
            return res.status(200).json(profile);
        }
        catch (error) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }
    async getUiSettings(req, res) {
        let token = req.cookies?.paperless_token ?? null;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let paperlessConnector = new PaperlessConnector(token);
        try {
            const uiSettings = await paperlessConnector.getUiSettings();
            return res.status(200).json(uiSettings);
        }
        catch (error) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }
}
