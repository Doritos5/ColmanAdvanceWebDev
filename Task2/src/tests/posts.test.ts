import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import postModel from "../models/postModel";
import userModel from "../models/userModel";
import { Express } from "express";

let app: Express;
let accessToken: string;
let userId: string;
let postId: string;

// Test user data
const testUser = {
    email: "test@user.com",
    password: "testpassword",
    username: "testuser"
};

// Test post data
const testPost = {
    title: "Test Post Title",
    content: "Test Post Content"
};

beforeAll(async () => {
    try {
        app = await initApp();

        await postModel.deleteMany();
        await userModel.deleteMany();

        await request(app).post("/auth/register").send(testUser);

        const loginRes = await request(app).post("/auth/login").send(testUser);
        accessToken = loginRes.body.accessToken;
        const decodedToken = JSON.parse(Buffer.from(loginRes.body.accessToken.split('.')[1], 'base64').toString());
        userId = decodedToken._id;
    } catch (error) {
        console.error("Error in beforeAll:", error);
        throw error;
    }
});

afterAll(async () => {
    // Close the MongoDB connection after all tests are done
    await mongoose.connection.close();
});

describe("Posts API Tests", () => {

    // Test: Create a new post (POST /post)
    test("Create new post", async () => {
        const response = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken) // Sending the token
            .send(testPost);
        
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(testPost.title);
        expect(response.body.content).toBe(testPost.content);
        expect(response.body.senderId).toBe(userId);
        
        // Save the post ID for subsequent tests
        postId = response.body._id;
    });

    // Test: Fail to create post without authentication
    test("Fail to create post without auth", async () => {
        const response = await request(app)
            .post("/post")
            .send(testPost);
        expect(response.statusCode).toBe(401);
    });

    // Test: Get all posts (GET /post)
    test("Get all posts", async () => {
        const response = await request(app).get("/post");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    // Test: Get post by ID (GET /post/:id)
    test("Get post by ID", async () => {
        const response = await request(app).get("/post/" + postId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
        expect(response.body.title).toBe(testPost.title);
    });

    // Test: Get non-existent post
    test("Get non-existent post", async () => {
        const fakeId = "654321654321654321654321"; // Valid MongoDB ObjectID format but fake
        const response = await request(app).get("/post/" + fakeId);
        expect(response.statusCode).toBe(404);
    });

    // Test: Update post (PUT /post/:id)
    test("Update post", async () => {
        const updatedData = {
            title: "Updated Title",
            content: "Updated Content"
        };

        const response = await request(app)
            .put("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken)
            .send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(updatedData.title);
        expect(response.body.content).toBe(updatedData.content);
    });

    // Test: Get comments by post ID (GET /post/comments/:postId)
    // Initially, this should return an empty list or success status
    test("Get comments by post ID", async () => {
        const response = await request(app)
            .get("/post/comments/" + postId)
            .set("Authorization", "Bearer " + accessToken);
        expect(response.statusCode).toBe(200);
        // Assuming it returns an array
        if (Array.isArray(response.body)) {
             expect(response.body.length).toBe(0);
        }
    });

    // Test: Delete post (DELETE /post/:id)
    test("Delete post", async () => {
        const response = await request(app)
            .delete("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken);
        
        // Based on your postRoute, it returns 200 on success
        expect(response.statusCode).toBe(200); 
    });

    // Test: Verify post is deleted
    test("Verify post is deleted", async () => {
        const response = await request(app).get("/post/" + postId);
        expect(response.statusCode).toBe(404);
    });

    // Test: Fail to update post without authentication
    test("Fail to update post without auth", async () => {
        // Create a new post to update
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);
        const newPostId = createRes.body._id;

        const response = await request(app)
            .put("/post/" + newPostId)
            .send({ title: "Hacked Title" });
        expect(response.statusCode).toBe(401);
    });

    // Test: Fail to update post as different user
    test("Fail to update post as different user", async () => {
        // Create a new user
        const newUser = {
            email: "other@user.com",
            password: "testpassword",
            username: "otheruser"
        };
        await request(app).post("/auth/register").send(newUser);
        const loginRes = await request(app).post("/auth/login").send(newUser);
        const otherToken = loginRes.body.accessToken;

        // Create a post as the first user
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);
        const newPostId = createRes.body._id;

        // Try to update with different user
        const response = await request(app)
            .put("/post/" + newPostId)
            .set("Authorization", "Bearer " + otherToken)
            .send({ title: "Hacked Title" });
        expect(response.statusCode).toBe(403);
    });

    // Test: Fail to delete post without authentication
    test("Fail to delete post without auth", async () => {
        // Create a new post to delete
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);
        const newPostId = createRes.body._id;

        const response = await request(app)
            .delete("/post/" + newPostId);
        expect(response.statusCode).toBe(401);
    });

    // Test: Fail to delete post as different user
    test("Fail to delete post as different user", async () => {
        // Create a new user
        const newUser = {
            email: "deleter@user.com",
            password: "testpassword",
            username: "deleteruser"
        };
        await request(app).post("/auth/register").send(newUser);
        const loginRes = await request(app).post("/auth/login").send(newUser);
        const otherToken = loginRes.body.accessToken;

        // Create a post as the first user
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);
        const newPostId = createRes.body._id;

        // Try to delete with different user
        const response = await request(app)
            .delete("/post/" + newPostId)
            .set("Authorization", "Bearer " + otherToken);
        expect(response.statusCode).toBe(403);
    });

    // Test: Delete non-existent post
    test("Delete non-existent post", async () => {
        const fakeId = "654321654321654321654321";
        const response = await request(app)
            .delete("/post/" + fakeId)
            .set("Authorization", "Bearer " + accessToken);
        expect(response.statusCode).toBe(404);
    });

    // Test: Get comments with invalid post ID
    test("Get comments with invalid post ID", async () => {
        const invalidId = "invalid-id";
        const response = await request(app)
            .get("/post/comments/" + invalidId)
            .set("Authorization", "Bearer " + accessToken);
        expect(response.statusCode).toBe(400);
    });

    // Test: Get comments from non-existent post
    test("Get comments from non-existent post", async () => {
        const fakeId = "654321654321654321654321";
        const response = await request(app)
            .get("/post/comments/" + fakeId)
            .set("Authorization", "Bearer " + accessToken);
        expect(response.statusCode).toBe(404);
    });
});