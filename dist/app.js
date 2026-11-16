"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const yamljs_1 = __importDefault(require("yamljs"));
const config_1 = require("./config");
const lists_1 = __importDefault(require("./routes/lists"));
const items_1 = __importDefault(require("./routes/items"));
const mongoose_1 = require("./models/mongoose");
const observability_1 = require("./config/observability");
// Use API_ALLOW_ORIGINS env var with comma separated urls like
// `http://localhost:300, http://otherurl:100`
// Requests coming to the api server from other urls will be rejected as per
// CORS.
const allowOrigins = process.env.API_ALLOW_ORIGINS;
// Use NODE_ENV to change webConfiguration based on this value.
// For example, setting NODE_ENV=development disables CORS checking,
// allowing all origins.
const environment = process.env.NODE_ENV;
const originList = () => {
    if (environment && environment === "development") {
        console.log(`Allowing requests from any origins. NODE_ENV=${environment}`);
        return "*";
    }
    const origins = [
        "https://portal.azure.com",
        "https://ms.portal.azure.com",
    ];
    if (allowOrigins && allowOrigins !== "") {
        allowOrigins.split(",").forEach(origin => {
            origins.push(origin);
        });
    }
    return origins;
};
const createApp = async () => {
    const config = await (0, config_1.getConfig)();
    const app = (0, express_1.default)();
    // Configuration
    (0, observability_1.observability)(config.observability);
    await (0, mongoose_1.configureMongoose)(config.database);
    // Middleware
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: originList()
    }));
    // API Routes
    app.use("/lists/:listId/items", items_1.default);
    app.use("/lists", lists_1.default);
    // Swagger UI
    const swaggerDocument = yamljs_1.default.load("./openapi.yaml");
    app.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map