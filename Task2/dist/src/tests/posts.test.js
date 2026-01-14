"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
let app;
let accessToken;
let userId;
let postId;
/**
 * Setup before all tests:
 * 1. Initialize the app (connect to DB).
 * 2. Clean the database.
 * 3. Create a test user and log in to get a token.
 */
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize the application using the function from server.ts
    app = yield (0, server_1.default)();
    console.log("Jest: App Initialized");
    // Clean up the database to ensure a fresh start
    yield userModel_1.default.deleteMany();
    yield postModel_1.default.deleteMany();
    // Register a new test user
    const userRes = yield (0, supertest_1.default)(app).post("/auth/register").send({
        email: "test@jest.com",
        password: "testpassword",
        imgUrl: "http://test.com/img.png"
    });
    userId = userRes.body._id;
    // Login to get the access token
    const loginRes = yield (0, supertest_1.default)(app).post("/auth/login").send({
        email: "test@jest.com",
        password: "testpassword"
    });
    accessToken = loginRes.body.accessToken;
    // Ensure we actually got a token, otherwise tests will fail
    expect(accessToken).toBeDefined();
}));
/**
 * Cleanup after all tests:
 * Close the MongoDB connection to prevent Jest from hanging.
 */
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("Posts API Tests", () => {
    /**
     * Test Case 1: GET /post
     * Should return an empty list initially (since we cleared the DB).
     */
    test("GET /post - should return empty list initially", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    }));
    /**
     * Test Case 2: POST /post
     * Should successfully create a post when a valid token is provided.
     */
    test("POST /post - should create a post with token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
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
    }));
    /**
     * Test Case 3: POST /post (Negative Test)
     * Should fail with 401 Unauthorized if no token is provided.
     */
    test("POST /post - should fail without token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/post")
            .send({
            title: "No Token Post",
            content: "Should fail"
        });
        expect(response.statusCode).toBe(401); // Expecting Unauthorized error
    }));
    /**
     * Test Case 4: PUT /post/:id
     * Should successfully update a post if the user owns it.
     */
    test("PUT /post/:id - should update post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken)
            .send({
            title: "Updated Title Jest"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Updated Title Jest");
    }));
    /**
     * Test Case 5: DELETE /post/:id
     * Should successfully delete the post.
     */
    test("DELETE /post/:id - should delete post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/post/" + postId)
            .set("Authorization", "Bearer " + accessToken);
        expect(response.statusCode).toBe(200);
    }));
});
//# sourceMappingURL=posts.test.js.map