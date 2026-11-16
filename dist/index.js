"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const observability_1 = require("./config/observability");
const main = async () => {
    const app = await (0, app_1.createApp)();
    const port = process.env.FUNCTIONS_CUSTOMHANDLER_PORT || process.env.PORT || 3100;
    app.listen(port, () => {
        observability_1.logger.info(`Started listening on port ${port}`);
    });
};
main();
//# sourceMappingURL=index.js.map