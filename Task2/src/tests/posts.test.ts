import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/userModel";
import Post from "../models/postModel";

let app: Express;
let accessToken: string;
let userId: string;
let postId: string;

/**
 * Setup before all tests:
 * 1. Initialize the app (connect to DB).
 * 2. Clean the database.
 * 3. Create a test user and log in to get a token.
 */
beforeAll(async () => {
    // Initialize the application using the function from server.ts
    app = await initApp();
    console.log("Jest: App Initialized");

    // Clean up the database to ensure a fresh start
    await User.deleteMany();
    await Post.deleteMany();

    // Register a new test user
    const userRes = await request(app).post("/auth/register").send({
        email: "test@jest.com",
        password: "testpassword",
        imgUrl: "http://test.com/img.png"
    });
    userId = userRes.body._id;

    // Login to get the access token
    const loginRes = await request(app).post("/auth/login").send({
        email: "test@jest.com",
        password: "testpassword"
    });
    
    accessToken = loginRes.body.accessToken;
    
    // Ensure we actually got a token, otherwise tests will fail
    expect(accessToken).toBeDefined(); 
});

/**
 * Cleanup after all tests:
 * Close the MongoDB connection to prevent Jest from hanging.
 */
afterAll(async () => {
    await mongoose.connection.close();
});

describe("Posts API Tests", () => {

    /**
     * Test Case 1: GET /post
     * Should return an empty list initially (since we cleared the DB).
     */
    test("GET /post - should return empty list initially", async () => {
        const response = await request(app).get("/post");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    /**
     * Test Case 2: POST /post
     * Should successfully create a post when a valid token is provided.
     */
    test("POST /post - should create a post with token", async () => {
        const response = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken) // Inject the token
            .send({
                title: "Jest Test Post",
                content: "Content from Jest"
            });
        
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe("Jest Test Post");
        expect(response.body.senderId).toBe(userId); // Verify ownership
        
        postId = response.body._id; // Save ID for subsequent tests
    });

    /**
     * Test Case 3: POST /post (Negative Test)
     * Should fail with 401 Unauthorized if no token is provided.
     */
    test("POST /post - should fail without token", async () => {
        const response = await request(app)
            .post("/post")
            .send({
                title: "No Token Post",
                content: "Should fail"
            });
        
        expect(response.statusCode).toBe(401); // Expecting Unauthorized error
    });

    /**
     * Test Case 4: PUT /post/:id
     * Should successfully update a post if the user owns it.
     */
    test("PUT /post/:id - should update post", async () => {
        const response = await request(app)
            .put("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken)
            .send({
                title: "Updated Title Jest"
            });
        
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Updated Title Jest");
    });

    /**
     * Test Case 5: DELETE /post/:id
     * Should successfully delete the post.
     */
    test("DELETE /post/:id - should delete post", async () => {
        const response = await request(app)
            .delete("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken);
        
        expect(response.statusCode).toBe(200);
    });
});