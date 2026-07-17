import { NodePgDatabase } from "drizzle-orm/node-postgres";
import Express from "express";
import { ApiRoute } from "./api";
import PaperlessConnector from "../libs/paperless/connector";
import logger from "../libs/logger";

export default class PaperlessBridgeRoute {
    constructor(app: Express.Application, private db: NodePgDatabase) {
        let paperlessRouter = Express.Router();
        app.use('/api/paperless', paperlessRouter);
        paperlessRouter.post('/sync_document_types', ApiRoute.checkUserLoggedIn.bind(this), this.syncDocumentTypes.bind(this));
        paperlessRouter.all('/{*path}', ApiRoute.checkUserLoggedIn.bind(this), this.paperlessProxy.bind(this));
    }

    async syncDocumentTypes(req: Express.Request, res: Express.Response) {
        let token = req.cookies?.paperless_token ?? null;
        let paperlessConnector = new PaperlessConnector(token);
        try {
            await paperlessConnector.syncDocumentTypes(this.db);
            return res.status(200).json({ message: "Document types synchronized successfully." });
        } catch (error: any) {
            return res.status(500).json(error.responseObject || { message: "An error occurred while synchronizing document types." });
        }
    }

    async paperlessProxy(req: Express.Request, res: Express.Response) {
        let token = req.cookies?.paperless_token ?? null;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let paperlessConnector = new PaperlessConnector(token);

        let options: RequestInit = {
            method: req.method,
            headers: new Headers({
                'Authorization': `Token ${token}`,
                'Content-Type': req.headers['content-type'] || 'application/json',  
            }),
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            options.body = JSON.stringify(req.body);
        }

        try {
            let url = PaperlessConnector.getURL(req.url.replace(/^\//, ""));
            if (!url.pathname.match(/\/$/)) {
                url.pathname += '/';
            }
            logger.debug(`Proxying request to Paperless: ${req.method} ${url.toString()}`);
            let response = await fetch(url, options);
            let data = await response.json();
            res.status(response.status).json(data);
        } catch (error: any) {
            res.status(500).json({ message: "An error occurred while connecting to paperless for the request.", error: error.message });
        }
    }
}