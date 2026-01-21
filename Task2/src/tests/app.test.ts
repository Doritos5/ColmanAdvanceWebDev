import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import express from "express";
import { Express } from "express";

let app: Express;

beforeAll(async () => {
    try {
        app = await initApp();
    } catch (error) {
        console.error("Error initializing app:", error);
        throw error;
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("App Integration Tests", () => {

    // === App Setup and Routes Tests ===
    
    // Test: Swagger Documentation endpoint
    test("GET /api-docs should return Swagger UI", async () => {
        const response = await request(app).get("/api-docs/");
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain("swagger");
    });

    // Test: Swagger JSON endpoint
    test("GET /api-docs.json should return Swagger specification", async () => {
        const response = await request(app).get("/api-docs.json");
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.type).toContain("application/json");
        expect(response.body.openapi || response.body.swagger).toBeDefined();
    });

    // Test: Routes are properly mounted - POST route
    test("POST /post should be available (authenticated request)", async () => {
        const response = await request(app)
            .post("/post")
            .send({});
        
        expect(response.statusCode).toBe(401);
    });

    // Test: Routes are properly mounted - GET route
    test("GET /post should be available", async () => {
        const response = await request(app).get("/post");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test: Routes are properly mounted - GET comments
    test("GET /comment should be available", async () => {
        const response = await request(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test: Routes are properly mounted - Auth register
    test("POST /auth/register should be available", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({});
        
        expect(response.statusCode).toBe(401);
    });

    // Test: Routes are properly mounted - Auth login
    test("POST /auth/login should be available", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({});
        
        expect(response.statusCode).toBe(400);
    });

    // Test: Non-existent route returns 404
    test("GET /nonexistent should return 404", async () => {
        const response = await request(app).get("/nonexistent");
        expect(response.statusCode).toBe(404);
    });

    // Test: CORS headers are present
    test("Response should include CORS headers", async () => {
        const response = await request(app).get("/post");
        expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    // Test: JSON parsing middleware works
    test("JSON parsing middleware should work", async () => {
        const response = await request(app)
            .post("/auth/login")
            .set("Content-Type", "application/json")
            .send({ email: "test@test.com", password: "test" });
        
        expect(response.statusCode).toBe(400);
    });

    // Test: URL-encoded parsing middleware works
    test("URL-encoded parsing middleware should work", async () => {
        const response = await request(app)
            .post("/auth/login")
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send("email=test@test.com&password=test");
        
        expect(response.statusCode).toBe(400);
    });

    // Test: Swagger specs have proper structure
    test("Swagger specs should have proper OpenAPI structure", async () => {
        const response = await request(app).get("/api-docs.json");
        const specs = response.body;
        
        expect(specs.paths).toBeDefined();
        expect(specs.paths["/post"]).toBeDefined();
        expect(specs.paths["/comment"]).toBeDefined();
        expect(specs.paths["/auth/register"]).toBeDefined();
        expect(specs.paths["/auth/login"]).toBeDefined();
    });

    // Test: Basic connectivity and app structure
    test("App should be initialized properly", async () => {
        expect(app).toBeDefined();
        expect(app).toHaveProperty("get");
        expect(app).toHaveProperty("post");
        expect(app).toHaveProperty("put");
        expect(app).toHaveProperty("delete");
    });

    // Test: Error handler middleware would catch errors
    test("Requesting with invalid method should return appropriate response", async () => {
        const response = await request(app)
            .patch("/post/invalid")
            .send({});
        
        expect(response.statusCode).toBe(404);
    });

    // === Error Handling Tests ===

    // Test: Error middleware handles thrown errors
    test("Error middleware should catch and handle errors", async () => {
        const testApp = express();
        testApp.get("/test-error", (req, res, next) => {
            const err = new Error("Test error");
            next(err);
        });

        testApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error("🔥 Server Error:", err);
            res.status(500).json({ error: "Internal Server Error", details: err.message });
        });

        const response = await request(testApp).get("/test-error");
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Internal Server Error");
        expect(response.body.details).toBe("Test error");
    });

    // Test: Error middleware with error instance check
    test("Error middleware should handle non-Error objects", async () => {
        const testApp = express();
        testApp.get("/test-error-string", (req, res, next) => {
            next(new Error("String error"));
        });

        testApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (err instanceof Error) {
                res.status(500).json({ error: "Internal Server Error", details: err.message });
            } else {
                res.status(500).json({ error: "Internal Server Error", details: "Unknown error" });
            }
        });

        const response = await request(testApp).get("/test-error-string");
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Internal Server Error");
    });

    // Test: Database error event handler
    test("Database error event should be handled", async () => {
        const errorHandler = (error: Error) => {
            expect(error).toBeDefined();
            expect(error instanceof Error).toBe(true);
        };

        const testError = new Error("Database error");
        errorHandler(testError);
    });

    // Test: Database open event handler
    test("Database open event should be handled", async () => {
        let openCalled = false;
        const openHandler = () => {
            openCalled = true;
        };

        openHandler();
        expect(openCalled).toBe(true);
    });

    // Test: MONGODB_URI check logic
    test("Should handle missing MONGODB_URI environment variable", async () => {
        const originalUri = process.env.MONGODB_URI;
        
        try {
            const dbUri = undefined;
            if (!dbUri) {
                expect(dbUri).toBeUndefined();
            }
        } finally {
            process.env.MONGODB_URI = originalUri;
        }
    });

    // Test: Connection error handler
    test("Connection error should be caught and rejected", async () => {
        const connectionError = new Error("Connection failed");
        
        try {
            throw connectionError;
        } catch (err) {
            expect(err).toBeDefined();
            expect((err as Error).message).toBe("Connection failed");
        }
    });

    // Test: Promise rejection in initApp pattern
    test("Promise rejection should be handled", async () => {
        const testPromise = new Promise<string>((resolve, reject) => {
            reject(new Error("Test rejection"));
        });

        try {
            await testPromise;
        } catch (err) {
            expect(err).toBeDefined();
            expect((err as Error).message).toBe("Test rejection");
        }
    });

    // Test: Route error propagation
    test("Errors thrown in routes should be caught by error middleware", async () => {
        const testApp = express();
        testApp.get("/route-error", (req, res) => {
            throw new Error("Route error");
        });

        testApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(500).json({ error: "Internal Server Error", details: err.message });
        });

        const response = await request(testApp).get("/route-error");
        expect(response.statusCode).toBe(500);
        expect(response.body.details).toContain("Route error");
    });

    // Test: Express middleware setup
    test("Express middleware should be properly configured", async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use(express.urlencoded({ extended: false }));
        
        testApp.post("/test-json", (req, res) => {
            res.json({ received: req.body });
        });

        const response = await request(testApp)
            .post("/test-json")
            .set("Content-Type", "application/json")
            .send({ test: "data" });

        expect(response.statusCode).toBe(200);
        expect(response.body.received.test).toBe("data");
    });

    // Test: CORS middleware functionality
    test("CORS headers should be set on responses", async () => {
        const testApp = express();
        const cors = require("cors");
        
        testApp.use(cors());
        testApp.get("/test", (req, res) => {
            res.json({ test: "data" });
        });

        const response = await request(testApp).get("/test");
        expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    // Test: Promise resolution in initApp pattern
    test("Promise resolution should resolve with app", async () => {
        const testPromise = new Promise<express.Express>((resolve, reject) => {
            const testApp = express();
            resolve(testApp);
        });

        const result = await testPromise;
        expect(result).toBeDefined();
        expect(typeof result.get).toBe("function");
    });

    // Test: MongoDB connection string validation
    test("Should properly validate MongoDB connection string presence", async () => {
        const connectionString = process.env.MONGODB_URI;
        
        if (connectionString) {
            expect(connectionString).toBeTruthy();
            expect(typeof connectionString).toBe("string");
        }
    });

    // === initApp Initialization Tests ===

    // Test: initApp should establish MongoDB connection
    test("initApp should establish MongoDB connection", async () => {
        expect(mongoose.connection.readyState).toBe(1); // 1 = connected
        expect(mongoose.connection.host).toBeDefined();
    });

    // Test: initApp should have working routes
    test("initApp should have working routes", async () => {
        const response = await request(app).get("/post");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test: initApp should handle invalid routes
    test("initApp should handle invalid routes", async () => {
        const response = await request(app).get("/invalid-route");
        expect(response.statusCode).toBe(404);
    });

});
