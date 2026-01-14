import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoute";
import commentRoutes from "./routes/commentRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { specs, swaggerUi } from "./swagger";

const app = express();
dotenv.config();
console.log("doritos: ", process.env.NODE_ENV);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
app.use("/users", userRoutes);

const initApp = (): Promise<Express> => {
    return new Promise<Express>((resolve, reject) => {
        const dbUri = process.env.MONGODB_URI;

        if (!dbUri) {
            console.error("MONGODB_URI is not defined in the environment variables.");
            reject(new Error("MONGODB_URI is not defined"));
        } else {
            mongoose.connect(dbUri, {})
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

export default app; // Default export of the app instance for testing
export { initApp }; // Named export of initApp function for server startup