export class APIError extends Error {
    responseCode;
    stacktraceRegexp = /at\s+(.*)\s+\((.*):(\d+):(\d+)\)/;
    constructor(message, responseCode = 500) {
        super(message);
        this.responseCode = responseCode;
    }
    get responseObject() {
        let stackTrace = this.stack?.split("\n").map(line => line.trim()) || [];
        stackTrace.shift();
        let stackTraceObj = stackTrace.map(line => {
            let match = this.stacktraceRegexp.exec(line);
            if (match) {
                let [, functionName, filePath, lineNumber, columnNumber] = match;
                return {
                    functionName,
                    filePath,
                    lineNumber: lineNumber,
                    columnNumber: columnNumber
                };
            }
            return line;
        });
        return {
            name: this.name,
            message: this.message,
            stackTrace: stackTraceObj
        };
    }
}
export class ApiPaperlessError extends APIError {
    URL;
    requestBody;
    responseBody;
    constructor(message, responseCode = 500, URL = "", requestBody = null, responseBody = null) {
        super(message, responseCode);
        super.name = "ApiPaperlessError";
        this.URL = URL;
        this.requestBody = requestBody;
        this.responseBody = responseBody;
    }
    get responseObject() {
        return {
            ...super.responseObject,
            URL: this.URL,
            requestBody: this.requestBody,
            responseBody: this.responseBody
        };
    }
}
export class EntityNotFoundError extends APIError {
    constructor(entity, responseCode = 404) {
        super(`Entity '${entity}' not found`, responseCode);
        super.name = "EntityNotFoundError";
    }
}
