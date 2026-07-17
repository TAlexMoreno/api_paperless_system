import Express from "express";
import { ApiRoute } from "./api";
import PaperlessConnector from "../libs/paperless/connector";
export default class PaperlessBridgeRoute {
    db;
    constructor(app, db) {
        this.db = db;
        let paperlessRouter = Express.Router();
        app.use('/api/paperless', paperlessRouter);
        paperlessRouter.post('/sync_document_types', ApiRoute.checkUserLoggedIn.bind(this), this.syncDocumentTypes.bind(this));
        paperlessRouter.all('/{*path}', ApiRoute.checkUserLoggedIn.bind(this), this.syncDocumentTypes.bind(this));
    }
    async syncDocumentTypes(req, res) {
        let token = req.cookies?.paperless_token ?? null;
        let paperlessConnector = new PaperlessConnector(token);
        try {
            await paperlessConnector.syncDocumentTypes(this.db);
            return res.status(200).json({ message: "Document types synchronized successfully." });
        }
        catch (error) {
            return res.status(500).json(error.responseObject || { message: "An error occurred while synchronizing document types." });
        }
    }
}
