import { Response } from "express";
import Post from '../models/postModel';
import Comment from '../models/commentModel';
import baseController from "./baseController";
import {AuthRequest} from "../middleware/authMiddleware";
import mongoose from "mongoose";

class PostController extends baseController {
    constructor() {
        super(Post);
    }

    async post(req: AuthRequest, res: Response) {
        req.body.senderId = (req as any).user?._id;
        return super.post(req, res);
    }

    async put(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const post = await Post.findById(req.params.id);
        if (post?.senderId.toString() !== userId) {
            res.status(403).json({error: "Forbidden"});
            return;
        }
        return super.put(req, res);
    }

    async del(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const post = await Post.findById(req.params.id);
        if (post?.senderId.toString() !== userId) {
            res.status(403).json({error: "Forbidden"});
            return;
        }

        if (post) {
            // Delete all comments associated with the post
            await Comment.deleteMany({ postId: post._id });

            // Call parent deletion method
            return super.del(req, res);
        }
        else{
            res.status(404).json({ error: "Post not found" });
        }
    }

    async getCommentsByPostId(req: AuthRequest, res: Response) {
            try {
                const {postId} = req.params;
                
                if (!mongoose.isValidObjectId(postId)) {
                    return res.status(400).json({error: 'Invalid postId'});
                }

                const post = await Post.findById(postId);
                
                if (!post) {
                    return res.status(404).json({error: "Post not found"});
                }
                // Optional: Verify that the requesting user is the owner of the post before fetching comments
                //     const userId = (req as any).user?._id;
                // if (post.senderId.toString() !== userId) {
                //     return res.status(403).json({error: "Forbidden"});
                // }

                const comments = await Comment.find({postId});
                res.json(comments);
            } catch (error) {
                res.status(500).json({error: error instanceof Error ? error.message : 'An unknown error occurred'});
            }
    }
}


export default new PostController();