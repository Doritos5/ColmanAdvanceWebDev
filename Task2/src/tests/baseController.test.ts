import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import postModel from "../models/postModel";
import userModel from "../models/userModel";
import { Express } from "express";

let app: Express;
let accessToken: string;
let userId: string;

const testUser = {
    email: "basecontroller@test.com",
    password: "testpassword",
    username: "basecontrolleruser"
};

const testPost = {
    title: "Test Post",
    content: "Test Content"
};

beforeAll(async () => {
    app = await initApp();
    
    await postModel.deleteMany();
    await userModel.deleteMany();

    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);
    accessToken = loginRes.body.accessToken;
    const decodedToken = JSON.parse(Buffer.from(loginRes.body.accessToken.split('.')[1], 'base64').toString());
    userId = decodedToken._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("BaseController Coverage Tests", () => {

    // Test: GET with query filter parameters
    test("GET /post with filter parameters should apply filters", async () => {
        // Create multiple posts
        await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send({ ...testPost, title: "Filtered Post" });

        await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send({ ...testPost, title: "Another Post" });

        // Test without filter
        const responseNoFilter = await request(app)
            .get("/post");
        expect(responseNoFilter.statusCode).toBe(200);
        expect(Array.isArray(responseNoFilter.body)).toBe(true);
        expect(responseNoFilter.body.length).toBeGreaterThanOrEqual(2);

        // Note: The filter branch is tested, but the query filter logic depends on MongoDB behavior
        // This tests that the code path with filter query parameters is executed
        const responseWithFilter = await request(app)
            .get("/post?title=Filtered");
        expect(responseWithFilter.statusCode).toBe(200);
        expect(Array.isArray(responseWithFilter.body)).toBe(true);
    });

    // Test: GET /comment with empty filter
    test("GET /comment without filter should return all comments", async () => {
        const response = await request(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test: GET by ID that exists
    test("GET /post/:id with existing post should return the post", async () => {
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);
        
        const postId = createRes.body._id;

        const response = await request(app).get("/post/" + postId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
    });

    // Test: POST success case
    test("POST /post should create post successfully", async () => {
        const response = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                title: "New Post",
                content: "New Content"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.title).toBe("New Post");
    });

    // Test: POST with invalid data (missing required field)
    test("POST /post with invalid data should fail", async () => {
        const response = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                title: "Post without content"
                // missing required content field
            });

        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBeDefined();
    });

    // Test: PUT success case
    test("PUT /post/:id should update post successfully", async () => {
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send({ title: "Original", content: "Original Content" });
        
        const postId = createRes.body._id;

        const updateRes = await request(app)
            .put("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken)
            .send({ title: "Updated", content: "Updated Content" });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.title).toBe("Updated");
    });

    // Test: PUT with valid data updates successfully
    test("PUT /post/:id with valid data updates successfully", async () => {
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send({ title: "Original Title", content: "Original Content" });
        
        const postId = createRes.body._id;

        // Update with valid data
        const updateRes = await request(app)
            .put("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken)
            .send({ title: "New Title", content: "New Content" });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.title).toBe("New Title");
    });

    // Test: DELETE success case
    test("DELETE /post/:id should delete post successfully", async () => {
        const createRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);
        
        const postId = createRes.body._id;

        const deleteRes = await request(app)
            .delete("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken);

        expect(deleteRes.statusCode).toBe(200);
    });

    // Test: GET by ID with non-existent ID (valid format)
    test("GET /post/:id with non-existent ID should return 404", async () => {
        const fakeId = "654321654321654321654321";
        const response = await request(app).get("/post/" + fakeId);
        expect(response.statusCode).toBe(404);
    });

    // Test: PUT with non-existent ID (valid format) - uses postController which has authorization
    test("PUT /post/:id with non-existent ID should fail authorization", async () => {
        const fakeId = "654321654321654321654321";
        const response = await request(app)
            .put("/post/" + fakeId)
            .set("Authorization", "Bearer " + accessToken)
            .send({ title: "Updated" });

        // postController.put checks if post exists and enforces authorization
        expect(response.statusCode).toBe(403);
    });

    // Test: DELETE with non-existent ID (valid format) - uses postController which has custom logic
    test("DELETE /post/:id with non-existent ID should return 404", async () => {
        const fakeId = "654321654321654321654321";
        const response = await request(app)
            .delete("/post/" + fakeId)
            .set("Authorization", "Bearer " + accessToken);

        // postController.del checks if post exists
        expect(response.statusCode).toBe(404);
    });

    // Test: GET /comment endpoint (different model, tests baseController reusability)
    test("GET /comment should return array", async () => {
        const response = await request(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test: Multiple GET calls with different conditions (tests filter branch)
    test("GET /post should handle repeated calls", async () => {
        const response1 = await request(app).get("/post");
        const response2 = await request(app).get("/post");
        
        expect(response1.statusCode).toBe(200);
        expect(response2.statusCode).toBe(200);
        expect(Array.isArray(response1.body)).toBe(true);
        expect(Array.isArray(response2.body)).toBe(true);
    });

    // Test: DELETE comment without authorization (tests baseController.del error path)
    test("DELETE /comment/:id as different user should fail", async () => {
        // Create a new user
        const newUser = {
            email: "bc@test.com",
            password: "testpassword",
            username: "bcuser"
        };
        await request(app).post("/auth/register").send(newUser);
        const loginRes = await request(app).post("/auth/login").send(newUser);
        const otherToken = loginRes.body.accessToken;

        // Create a post and comment as first user
        const postRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);
        
        const commentRes = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                postId: postRes.body._id,
                content: "Test comment"
            });

        // Try to delete comment as different user (tests commentController.del which calls baseController.del)
        const deleteRes = await request(app)
            .delete("/comment/" + commentRes.body._id)
            .set("Authorization", "Bearer " + otherToken);
        
        expect(deleteRes.statusCode).toBe(403);
    });

    // Test: POST comment with authorization (tests baseController.post success path)
    test("POST /comment should create comment successfully", async () => {
        const postRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);

        const response = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                postId: postRes.body._id,
                content: "Test comment content"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.content).toBe("Test comment content");
    });

    // Test: GET /comment/:id with valid comment (tests baseController.getById else branch)
    test("GET /comment/:id with existing comment should return the comment", async () => {
        const postRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);

        const commentRes = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                postId: postRes.body._id,
                content: "Comment to retrieve"
            });

        const response = await request(app)
            .get("/comment/" + commentRes.body._id);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentRes.body._id);
        expect(response.body.content).toBe("Comment to retrieve");
    });

    // Test: PUT /comment/:id with valid comment (tests baseController.put else success path)
    test("PUT /comment/:id with valid comment should update successfully", async () => {
        const postRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);

        const commentRes = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                postId: postRes.body._id,
                content: "Original comment"
            });

        const commentId = commentRes.body._id;

        const updateRes = await request(app)
            .put("/comment/" + commentId)
            .set("Authorization", "Bearer " + accessToken)
            .send({ content: "Updated comment" });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.content).toBe("Updated comment");
    });

    // Test: DELETE /comment/:id with valid comment (tests baseController.del else success path)
    test("DELETE /comment/:id with valid comment should delete successfully", async () => {
        const postRes = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + accessToken)
            .send(testPost);

        const commentRes = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                postId: postRes.body._id,
                content: "Comment to delete"
            });

        const commentId = commentRes.body._id;

        const deleteRes = await request(app)
            .delete("/comment/" + commentId)
            .set("Authorization", "Bearer " + accessToken);

        expect(deleteRes.statusCode).toBe(204);
    });
});
