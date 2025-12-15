// javascript
const mongoose = require('mongoose');
const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

const createComment = async (req, res) => {
    try {
        const { postId, senderId, content } = req.body;

        if (!postId || !senderId || !content) {
            return res.status(400).json({ error: 'postId, senderId and content are required' });
        }

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({ error: 'Invalid postId' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found for given postId' });
        }

        const comment = new Comment({ postId, senderId, content });
        const savedComment = await comment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid comment id' });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json(comment);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid comment id' });
        }

        const { postId, content } = req.body;

        if (!postId || !content) {
            return res.status(400).json({ error: 'postId and content are required' });
        }

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({ error: 'Invalid postId' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found for given postId' });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const requesterId = req.body.senderId;
        if (!requesterId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (String(comment.senderId) !== requesterId) {
            return res.status(403).json({ error: 'Forbidden: not comment owner' });
        }

        // perform update without changing senderId
        comment.postId = postId;
        comment.content = content;
        const updatedComment = await comment.save();

        res.json(updatedComment);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid comment id' });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const requesterId = req.body.senderId;
        if (!requesterId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (String(comment.senderId) !== requesterId) {
            return res.status(403).json({ error: 'Forbidden: not comment owner' });
        }

        await Comment.findByIdAndDelete(id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({ error: 'Invalid postId' });
        }

        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createComment,
    getAllComments,
    getCommentById,
    updateComment,
    deleteComment,
    getCommentsByPostId
};
