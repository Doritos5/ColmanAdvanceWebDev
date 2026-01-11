import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export type AuthRequest = Request & { user?: { _id: string } };

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const secret: string = process.env.JWT_SECRET || "secretkey";

    try {
        const decoded = jwt.verify(token, secret) as { _id: string };

        // Debug Log: הסר את זה אחרי שהכל עובד
        // console.log("🔍 Decoded Token:", decoded);
        
        req.user = { _id: decoded._id };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};


export default authMiddleware;