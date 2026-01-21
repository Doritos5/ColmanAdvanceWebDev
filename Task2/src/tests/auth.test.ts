import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import userModel from "../models/userModel";
import { Express } from "express";

let app: Express;

const testUser = {
    email: "auth@test.com",
    password: "testpassword123",
    username: "authuser"
};

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Authentication API Tests", () => {

    // Test: Register a new user
    test("Register new user", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.email).toBe(testUser.email);
    });

    // Test: Fail to register with missing email
    test("Fail to register without email", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                password: testUser.password
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    // Test: Fail to register with missing password
    test("Fail to register without password", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                email: "test2@email.com"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    // Test: Fail to register with duplicate email
    test("Fail to register with duplicate email", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(409);
        expect(response.body.error).toBe("Email already exists");
    });

    // Test: Login with valid credentials
    test("Login with valid credentials", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body._id).toBeDefined();
    });

    // Test: Fail to login with missing email
    test("Fail to login without email", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                password: testUser.password
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    // Test: Fail to login with missing password
    test("Fail to login without password", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: testUser.email
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    // Test: Fail to login with non-existent email
    test("Fail to login with non-existent email", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "nonexistent@email.com",
                password: "anypassword"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid email or password");
    });

    // Test: Fail to login with wrong password
    test("Fail to login with wrong password", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: testUser.email,
                password: "wrongpassword"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid email or password");
    });

    // Test: Refresh token with valid refresh token
    test("Refresh token with valid refresh token", async () => {
        // First login to get a refresh token
        const loginRes = await request(app)
            .post("/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        const refreshToken = loginRes.body.refreshToken;

        // Now use the refresh token
        const response = await request(app)
            .post("/auth/refresh-token")
            .send({
                refreshToken: refreshToken
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
    });

    // Test: Fail to refresh with missing refresh token
    test("Fail to refresh token without refresh token", async () => {
        const response = await request(app)
            .post("/auth/refresh-token")
            .send({});

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("Refresh token is required");
    });

    // Test: Fail to refresh with invalid refresh token
    test("Fail to refresh token with invalid refresh token", async () => {
        const response = await request(app)
            .post("/auth/refresh-token")
            .send({
                refreshToken: "invalid.refresh.token"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    // Test: Fail to refresh token with revoked refresh token
    test("Fail to refresh token with revoked refresh token", async () => {
        const response = await request(app)
            .post("/auth/refresh-token")
            .send({
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTQzMjE2NTQzMjE2NTQzMjE2NTQzMjEiLCJpYXQiOjE2OTg0MDAwMDAsImV4cCI6MTY5ODQ4NjQwMH0.invalid"
            });

        expect(response.statusCode).toBe(401);
    });
});
