export class APIError extends Error {
    responseCode: number;
    stacktraceRegexp = /at\s+(.*)\s+\((.*):(\d+):(\d+)\)/;
    constructor(message: string, responseCode: number = 500) {
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
        }
    }
}

export class ApiPaperlessError extends APIError {
    URL: string;
    requestBody: any;
    responseBody: any;
    constructor(message: string, responseCode: number = 500, URL: string = "", requestBody: any = null, responseBody: any = null) {
        super(message, responseCode);
        super.name = "ApiPaperlessError";
        this.URL = URL;
        this.requestBody = requestBody;
        this.responseBody = responseBody;
    }

    get responseObject() {
        super.responseObject;
        return {
            ...super.responseObject,
            URL: this.URL,
            requestBody: this.requestBody,
            responseBody: this.responseBody
        }
    }
}

export class EntityNotFoundError extends APIError {
    constructor(entity: string, responseCode: number = 404) {
        super(`Entity '${entity}' not found`, responseCode);
        super.name = "EntityNotFoundError";
    }
}