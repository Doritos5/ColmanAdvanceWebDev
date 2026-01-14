import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import postRoutes from "./routes/postRoute";
import commentRoutes from "./routes/commentRoutes";
import authRoutes from "./routes/authRoutes";
import { specs, swaggerUi } from "./swagger";

const initApp = (): Promise<Express> => {
    return new Promise<Express>((resolve, reject) => {
        const app = express();
        
        // Middleware setup
        app.use(express.urlencoded({ extended: false }));
        app.use(express.json());
        app.use(cors());

        // Swagger Documentation
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
            explorer: true,
            customCss: ".swagger-ui .topbar { display: none }",
            customSiteTitle: "Posts & Comments API Documentation"
        }));

        // Swagger JSON endpoint
        app.get("/api-docs.json", (req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.send(specs);
        });

        // Routes
        app.use("/comment", commentRoutes);
        app.use("/post", postRoutes);
        app.use("/auth", authRoutes);

        // Middleware for error handling
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error("🔥 Server Error:", err);
            res.status(500).json({ error: "Internal Server Error", details: err.message });
        });

        // Connect to MongoDB
        const dbUri = process.env.MONGODB_URI;

        if (!dbUri) {
            console.error("MONGODB_URI is not defined in the environment variables.");
            reject(new Error("MONGODB_URI is not defined"));
        } else {
            mongoose.connect(dbUri, {})
                .then(() => {
                    console.log("Successfully connected to MongoDB");
                    resolve(app);
                })
                .catch((err) => {
                    console.error("🔥🔥🔥 Database Connection Error 🔥🔥🔥");
                    console.error("Could not connect to MongoDB. Please ensure MongoDB is running.");
                    console.error("Connection string:", dbUri);
                    console.error(err);
                    reject(err);
                });
        }
        
        const db = mongoose.connection;
        db.on("error", (error) => {
            console.error(error);
        });
        db.once("open", () => {
            console.log("Connected to MongoDB");
        });
    });
};

export default initApp;
