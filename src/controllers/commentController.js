const mongoose = require('mongoose');
const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

const createComment = async (req, res, next) => {
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
        next(err);
    }
};

const getAllComments = async (req, res, next) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        next(err);
    }
};

const getCommentById = async (req, res, next) => {
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
        next(err);
    }
};

const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid comment id' });
        }

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

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { postId, senderId, content },
            { new: true, runValidators: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json(updatedComment);
    } catch (err) {
        next(err);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid comment id' });
        }

        const deleted = await Comment.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        next(err);
    }
};

const getCommentsByPostId = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({ error: 'Invalid postId' });
        }

        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        next(err);
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

