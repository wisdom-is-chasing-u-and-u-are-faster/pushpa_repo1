"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationInsightsTransport = void 0;
const Contracts_1 = require("applicationinsights/out/Declarations/Contracts");
const winston_transport_1 = __importDefault(require("winston-transport"));
const observability_1 = require("./observability");
class ApplicationInsightsTransport extends winston_transport_1.default {
    constructor(opts) {
        super(opts);
        this.client = opts.client;
    }
    log(info, callback) {
        const telemetry = {
            severity: convertToSeverity(info.level),
            message: info.message,
        };
        this.client.trackTrace(telemetry);
        callback();
    }
}
exports.ApplicationInsightsTransport = ApplicationInsightsTransport;
const convertToSeverity = (level) => {
    switch (level) {
        case observability_1.LogLevel.Debug:
            return Contracts_1.SeverityLevel.Verbose;
        case observability_1.LogLevel.Verbose:
            return Contracts_1.SeverityLevel.Verbose;
        case observability_1.LogLevel.Error:
            return Contracts_1.SeverityLevel.Error;
        case observability_1.LogLevel.Warning:
            return Contracts_1.SeverityLevel.Warning;
        case observability_1.LogLevel.Information:
            return Contracts_1.SeverityLevel.Information;
        default:
            return Contracts_1.SeverityLevel.Verbose;
    }
};
//# sourceMappingURL=applicationInsightsTransport.js.map