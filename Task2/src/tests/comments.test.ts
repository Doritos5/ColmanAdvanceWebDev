import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import commentModel from "../models/commentModel";
import postModel from "../models/postModel";
import userModel from "../models/userModel";
import { Express } from "express";

let app: Express;
let accessToken: string;
let userId: string;
let postId: string;
let commentId: string;

const testUser = {
    email: "commenter@test.com",
    password: "testpassword",
    username: "commenter"
};

const testPost = {
    title: "Post for Comments",
    content: "This post exists solely to be commented on."
};

const testComment = {
    content: "This is a test comment"
};

beforeAll(async () => {
    app = await initApp();
    
    // 1. Clean database
    await commentModel.deleteMany();
    await postModel.deleteMany();
    await userModel.deleteMany();

    // 2. Register and Login to get token
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);
    accessToken = loginRes.body.accessToken;
    const decodedToken = JSON.parse(Buffer.from(loginRes.body.accessToken.split('.')[1], 'base64').toString());
    userId = decodedToken._id;

    // 3. Create a post to comment on
    const postRes = await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + accessToken)
        .send(testPost);
    postId = postRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Comments API Tests", () => {

    // Test: Create a new comment (POST /comment)
    test("Create new comment", async () => {
        const response = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + accessToken)
            .send({
                postId: postId,
                content: testComment.content
            });
        
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(testComment.content);
        expect(response.body.postId).toBe(postId);
        expect(response.body.senderId).toBe(userId);
        
        commentId = response.body._id;
    });

    // Test: Get all comments (GET /comment)
    test("Get all comments", async () => {
        const response = await request(app).get("/comment");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    // Test: Get comment by ID (GET /comment/:id)
    test("Get comment by ID", async () => {
        const response = await request(app).get("/comment/" + commentId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
        expect(response.body.content).toBe(testComment.content);
    });

    // Test: Update comment (PUT /comment/:id)
    test("Update comment", async () => {
        const updatedContent = "Updated comment content";
        const response = await request(app)
            .put("/comment/" + commentId)
            .set("Authorization", "Bearer " + accessToken)
            .send({ content: updatedContent });

        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(updatedContent);
    });

    // Test: Delete comment (DELETE /comment/:id)
    test("Delete comment", async () => {
        const response = await request(app)
            .delete("/comment/" + commentId)
            .set("Authorization", "Bearer " + accessToken);
        
        // Assuming your BaseController returns 200 on delete (like posts)
        expect(response.statusCode).toBe(204); 
    });

    // Test: Verify comment is deleted
    test("Verify comment is deleted", async () => {
        const response = await request(app).get("/comment/" + commentId);
        expect(response.statusCode).toBe(404);
    });
});