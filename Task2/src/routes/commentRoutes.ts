import express from 'express';
import authMiddleware from "../middleware/authMiddleware";
import commentController from "../controllers/commentController";

const router = express.Router();

/**
 * @swagger
 * /comment:
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
router.post("/", authMiddleware, commentController.post.bind(commentController));

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve a list of all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/", commentController.get.bind(commentController));

/**
 * @swagger
 * /comment/{id}:
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
router.get("/:id", commentController.getById.bind(commentController));

/**
 * @swagger
 * /comment/{id}:
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
router.put("/:id", authMiddleware, commentController.put.bind(commentController));

/**
 * @swagger
 * /comment/{id}:
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
router.delete("/:id", authMiddleware, commentController.del.bind(commentController));

export default router;
