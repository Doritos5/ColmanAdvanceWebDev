"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
dotenv_1.default.config();
console.log("doritos: ", process.env.NODE_ENV);
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
// Swagger Documentation
app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Posts & Comments API Documentation"
}));
// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swagger_1.specs);
});
// Routes
app.use("/comment", commentRoutes_1.default);
app.use("/post", postRoute_1.default);
app.use("/auth", authRoutes_1.default);
app.use("/users", userRoutes_1.default);
const initApp = () => {
    return new Promise((resolve, reject) => {
        const dbUri = process.env.MONGODB_URI;
        if (!dbUri) {
            console.error("MONGODB_URI is not defined in the environment variables.");
            reject(new Error("MONGODB_URI is not defined"));
        }
        else {
            mongoose_1.default.connect(dbUri, {})
                .then(() => {
                console.log("Connected to MongoDB");
                resolve(app); // returns app
            })
                .catch((err) => {
                reject(err);
            });
        }
    });
};
exports.initApp = initApp;
exports.default = app; // Default export of the app instance for testing
//# sourceMappingURL=app.js.map