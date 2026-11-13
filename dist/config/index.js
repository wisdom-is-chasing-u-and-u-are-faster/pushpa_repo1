"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const identity_1 = require("@azure/identity");
const keyvault_secrets_1 = require("@azure/keyvault-secrets");
const observability_1 = require("../config/observability");
const getConfig = async () => {
    // Load any ENV vars from local .env file
    if (process.env.NODE_ENV !== "production") {
        dotenv_1.default.config();
    }
    await populateEnvironmentFromKeyVault();
    // Load configuration after Azure KeyVault population is complete
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require("config");
    const databaseConfig = config.get("database");
    const observabilityConfig = config.get("observability");
    if (!databaseConfig.connectionString) {
        observability_1.logger.warn("database.connectionString is required but has not been set. Ensure environment variable 'AZURE_COSMOS_CONNECTION_STRING' has been set");
    }
    if (!observabilityConfig.connectionString) {
        observability_1.logger.warn("observability.connectionString is required but has not been set. Ensure environment variable 'APPLICATIONINSIGHTS_CONNECTION_STRING' has been set");
    }
    return {
        observability: {
            connectionString: observabilityConfig.connectionString,
            roleName: observabilityConfig.roleName,
        },
        database: {
            connectionString: databaseConfig.connectionString,
            databaseName: databaseConfig.databaseName,
        },
    };
};
exports.getConfig = getConfig;
const populateEnvironmentFromKeyVault = async () => {
    // If Azure key vault endpoint is defined
    // 1. Login with Default credential (managed identity or service principal)
    // 2. Overlay key vault secrets on top of ENV vars
    const keyVaultEndpoint = process.env.AZURE_KEY_VAULT_ENDPOINT || "";
    if (!keyVaultEndpoint) {
        observability_1.logger.warn("AZURE_KEY_VAULT_ENDPOINT has not been set. Configuration will be loaded from current environment.");
        return;
    }
    try {
        observability_1.logger.info("Populating environment from Azure KeyVault...");
        const credential = new identity_1.DefaultAzureCredential({});
        const secretClient = new keyvault_secrets_1.SecretClient(keyVaultEndpoint, credential);
        for await (const secretProperties of secretClient.listPropertiesOfSecrets()) {
            const secret = await secretClient.getSecret(secretProperties.name);
            // KeyVault does not support underscores in key names and replaces '-' with '_'
            // Expect KeyVault secret names to be in conventional capitalized snake casing after conversion
            const keyName = secret.name.replace(/-/g, "_");
            process.env[keyName] = secret.value;
        }
    }
    catch (err) {
        observability_1.logger.error(`Error authenticating with Azure KeyVault.  Ensure your managed identity or service principal has GET/LIST permissions. Error: ${err}`);
        throw err;
    }
};
//# sourceMappingURL=index.js.map