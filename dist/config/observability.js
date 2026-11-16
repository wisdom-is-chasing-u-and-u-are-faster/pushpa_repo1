"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.observability = exports.logger = exports.LogLevel = void 0;
const applicationInsights = __importStar(require("applicationinsights"));
const winston_1 = __importDefault(require("winston"));
const applicationInsightsTransport_1 = require("./applicationInsightsTransport");
var LogLevel;
(function (LogLevel) {
    LogLevel["Error"] = "error";
    LogLevel["Warning"] = "warn";
    LogLevel["Information"] = "info";
    LogLevel["Verbose"] = "verbose";
    LogLevel["Debug"] = "debug";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
exports.logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: "exceptions.log" }),
    ]
});
const observability = (config) => {
    // Append App Insights to the winston logger
    exports.logger.defaultMeta = {
        app: config.roleName
    };
    try {
        applicationInsights
            .setup(config.connectionString)
            .setAutoDependencyCorrelation(true)
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true, true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .setAutoCollectConsole(true)
            .setUseDiskRetryCaching(true)
            .setSendLiveMetrics(true)
            .setDistributedTracingMode(applicationInsights.DistributedTracingModes.AI_AND_W3C);
        applicationInsights.defaultClient.context.tags[applicationInsights.defaultClient.context.keys.cloudRole] = config.roleName;
        applicationInsights.defaultClient.setAutoPopulateAzureProperties(true);
        applicationInsights.start();
        const applicationInsightsTransport = new applicationInsightsTransport_1.ApplicationInsightsTransport({
            client: applicationInsights.defaultClient,
            level: LogLevel.Information,
            handleExceptions: true,
            handleRejections: true, // Handles node promise rejections
        });
        exports.logger.add(applicationInsightsTransport);
        exports.logger.info("Added ApplicationInsights logger transport");
    }
    catch (err) {
        exports.logger.error(`ApplicationInsights setup failed, ensure environment variable 'APPLICATIONINSIGHTS_CONNECTION_STRING' has been set. Error: ${err}`);
    }
};
exports.observability = observability;
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
//# sourceMappingURL=observability.js.map