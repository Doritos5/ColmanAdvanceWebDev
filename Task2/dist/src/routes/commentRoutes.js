"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const commentController_1 = __importDefault(require("../controllers/commentController"));
const router = express_1.default.Router();
/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Add a new comment to a specific post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: ID of the post
 *               content:
 *                 type: string
 *                 description: Content of the comment
 *             required:
 *               - postId
 *               - content
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post("/", authMiddleware_1.default, commentController_1.default.post.bind(commentController_1.default));
/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve a list of all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/", commentController_1.default.get.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a specific comment by its ID
 *     tags: [Comments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     responses:
 *       200:
 *         description: Comment details
 *       404:
 *         description: Comment not found
 */
router.get("/:id", commentController_1.default.getById.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Modify the content of an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated content of the comment
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.put("/:id", authMiddleware_1.default, commentController_1.default.put.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Remove a comment by its ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete("/:id", authMiddleware_1.default, commentController_1.default.del.bind(commentController_1.default));
exports.default = router;
//# sourceMappingURL=commentRoutes.js.map