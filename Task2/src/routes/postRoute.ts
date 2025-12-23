import express from 'express';
import postController from '../controllers/postController';

const router = express.Router();

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     description: Add a new post created by a user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *               content:
 *                 type: string
 *                 description: Content of the post
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', postController.post.bind(postController));

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', postController.get.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a specific post by its ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/:id', postController.getById.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post
 *     description: Modify the content of an existing post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the post
 *               content:
 *                 type: string
 *                 description: Updated content of the post
 *             required:
 *               - title
 *               - content
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.put('/:id', postController.put.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Remove a post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete('/:id', postController.del.bind(postController));

/**
 * @swagger
 * /post/comments/{postId}:
 *   get:
 *     summary: Get all comments for a specific post
 *     description: Retrieve all comments associated with a specific post
 *     tags: [Posts, Comments]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: List of comments for the post
 *       404:
 *         description: Post not found
 */
router.get('/comments/:postId', postController.getCommentsByPostId.bind(postController));

export default router;
