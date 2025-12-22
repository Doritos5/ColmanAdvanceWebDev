const Post = require('../models/postModel');
const Comment = require('../models/commentModel');

const getAllPosts = async (req, res) => {
    const filter = req.query.sender ? { sender: req.query.sender } : {}; // Filter by sender if provided
    
    try {
        const posts = await Post.find(filter);
        res.send(posts);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getPostById = async (req, res) => {
    const id = req.params.id;
    
    try {
        const post = await Post.findById(id);
        if (post) {
            res.send(post);
        } else {
            res.status(404).send("Post not found");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const createPost = async (req, res) => {
    try {
        const post = await Post.create(req.body);
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const updatePost = async (req, res) => {
    const id = req.params.id;
    try {
        // return the updated document
        const post = await Post.findByIdAndUpdate(id, req.body, { new: true }); 
        if (post) {
            res.send(post);
        } else {
            res.status(404).send("Post not found");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Delete a post and all related comments
const deletePost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Delete all comments related to this post
        await Comment.deleteMany({ postId: id });

        res.json({ message: 'Post and related comments deleted successfully' });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};