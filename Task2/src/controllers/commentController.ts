import {Response} from "express";
import Comment from '../models/commentModel';
import {AuthRequest} from "../middleware/authMiddleware";


import baseController from "./baseController";

class CommentController extends baseController {
    constructor() {
        super(Comment);
    }
    
    async post(req: AuthRequest, res: Response) {
        req.body.senderId = (req as any).user?._id;
        return super.post(req, res);
    }

    async put(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const comment = await Comment.findById(req.params.id);
        if (comment?.senderId.toString() !== userId) {
            res.status(403).json({error: "Forbidden"});
            return;
        }
        return super.put(req, res);
    }

    async del(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const comment = await Comment.findById(req.params.id);
        if (comment?.senderId.toString() !== userId) {
            res.status(403).json({error: "Forbidden"});
            return;
        }
        return super.del(req, res);
    }
}

export default new CommentController();