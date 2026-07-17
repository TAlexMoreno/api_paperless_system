import { APIError } from "../api/apiError.js";
import PaperlessConnector from "../libs/paperless/connector.js";
export class SecurityRoute {
    constructor(app) {
        app.post('/api/login', this.handleLogin.bind(this));
        app.post('/api/logout', this.handleLogout.bind(this));
    }
    async handleLogin(req, res) {
        let username = req.body.username ?? null;
        let password = req.body.password ?? null;
        if (req.cookies && req.cookies.paperless_token) {
            let paperlessConnector = new PaperlessConnector(req.cookies.paperless_token);
            try {
                await paperlessConnector.getProfile(); // Validate token
                return res.status(200).json({ message: "Already logged in" });
            }
            catch (error) {
                res.clearCookie('paperless_token', { httpOnly: true, secure: true, sameSite: 'strict' });
            }
        }
        if (!username || !password) {
            throw new APIError("Username and password are required", 400);
        }
        try {
            let response = await PaperlessConnector.login(username, password);
            res.cookie('paperless_token', response.token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
            return res.status(200).json(response);
        }
        catch (error) {
            throw new APIError(error.message, 401);
        }
    }
    async handleLogout(req, res) {
        res.clearCookie('paperless_token', { httpOnly: true, secure: true, sameSite: 'strict' });
        return res.status(200).json({ message: "Logged out successfully" });
    }
}
