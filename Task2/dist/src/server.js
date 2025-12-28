"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
/**
 * Start the server ONLY if we are not in test mode.
 * Jest sets NODE_ENV to 'test' automatically.
 */
if (process.env.NODE_ENV !== "test") {
    (0, app_1.initApp)().then((app) => {
        // Start listening only after DB connection is established
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }).catch((err) => {
        console.error("Error initializing app:", err);
    });
}
// Export initApp to satisfy any external requirements
exports.default = app_1.initApp;
//# sourceMappingURL=server.js.map