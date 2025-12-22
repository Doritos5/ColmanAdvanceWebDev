const express = require('express');
const commentsController = require('../controllers/commentController');

const router = express.Router();

// Create a new comment: POST /comments
router.post('/', commentsController.createComment);

// Get all comments: GET /comments
router.get('/', commentsController.getAllComments);

// Get a single comment by ID: GET /comments/:id
router.get('/:id', commentsController.getCommentById);

// Update a comment: PUT /comments/:id
router.put('/:id', commentsController.updateComment);

// Delete a comment: DELETE /comments/:id
router.delete('/:id', commentsController.deleteComment);

// Get all comments for a specific post: GET /comments/post/:postId
router.get('/post/:postId', commentsController.getCommentsByPostId);

module.exports = router;
