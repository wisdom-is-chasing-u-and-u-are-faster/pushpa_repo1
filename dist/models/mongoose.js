"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMongoose = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const observability_1 = require("../config/observability");
const configureMongoose = async (config) => {
    mongoose_1.default.set("toJSON", {
        virtuals: true,
        versionKey: false,
        transform: (_, converted) => {
            converted.id = converted._id;
            delete converted._id;
        }
    });
    try {
        const db = mongoose_1.default.connection;
        db.on("connecting", () => observability_1.logger.info("Mongoose connecting..."));
        db.on("connected", () => observability_1.logger.info("Mongoose connected successfully!"));
        db.on("disconnecting", () => observability_1.logger.info("Mongoose disconnecting..."));
        db.on("disconnected", () => observability_1.logger.info("Mongoose disconnected successfully!"));
        db.on("error", (err) => observability_1.logger.error("Mongoose database error:", err));
        await mongoose_1.default.connect(config.connectionString, { dbName: config.databaseName });
    }
    catch (err) {
        observability_1.logger.error(`Mongoose database error: ${err}`);
        throw err;
    }
};
exports.configureMongoose = configureMongoose;
//# sourceMappingURL=mongoose.js.map