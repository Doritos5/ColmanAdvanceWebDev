import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const sendError = (res: Response, message: string, code?: number) => {
    const errCode = code || 400;
    res.status(errCode).json({ error: message });
}

type Tokens = {
    accessToken: string;
    refreshToken: string;
}
const generateToken = (userId: string): Tokens => {
    const secret: string = process.env.JWT_SECRET || "secretkey";
    const refreshSecret: string = process.env.JWT_REFRESH_SECRET || "refreshsecret";
    const exp: number = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
    const refreshexp: number = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "86400"); // 24 hours
    const accessToken = jwt.sign(
        { _id: userId },
        secret,
        { expiresIn: exp }
    );
    const refreshToken = jwt.sign(
        { _id: userId },
        refreshSecret,
        { expiresIn: refreshexp } // 24 hours
    );
    return { accessToken: accessToken, refreshToken };
}
const register = async (req: Request, res: Response) => {
    // Registration logic here
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, "Email and password are required", 401);
    }
   try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, "Email already exists", 409);
        }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ email, password: encryptedPassword });

        //generate JWT token
        // const secret: string = process.env.JWT_SECRET || "secretkey";
        // const exp: number = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
        const tokens = generateToken(user._id.toString());
        user.refreshToken.push(tokens.refreshToken);
        await user.save();

        //send token back to user
        res.status(201).json({
            _id: user._id,
            email: user.email
        });

    } catch (error) {
        console.error("Registration error:", error);
        return sendError(res, "Registration failed", 500);
    }
};

const login = async (req: Request, res: Response) => {
    // Login logic here
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, "Email and password are required", 400);
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, "Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, "Invalid email or password");
        }

        // generate JWT token
        const tokens = generateToken(user._id.toString());
        
        // save refresh token to DB
        user.refreshToken.push(tokens.refreshToken);
        await user.save();

        //send token back to user
        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id
        });

    } catch (error) {
        return sendError(res, "Login failed", 500);
    }
};

const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return sendError(res, "Refresh token is required", 401);
    }

    try {
        const refreshSecret: string = process.env.JWT_REFRESH_SECRET || "refreshsecret";
        const decoded: any = jwt.verify(refreshToken, refreshSecret);
    
        const user = await User.findById(decoded._id);
        if (!user) {
            return sendError(res, "Invalid refresh token", 401);
        }
    
        if (!user.refreshToken.includes(refreshToken)) {
            //remove all refresh tokens from user
            user.refreshToken = [];
            await user.save();
            return sendError(res, "Invalid refresh token", 401);
        }
    
        //generate new tokens
        const tokens = generateToken(user._id.toString());
        user.refreshToken.push(tokens.refreshToken);
        //remove old refresh token
        user.refreshToken = user.refreshToken.filter((rt: any) => rt !== refreshToken);
        await user.save();
    
        res.status(200).json(tokens);
    } catch (error) {
        return sendError(res, "Invalid refresh token", 401);
    }
};

export default {
    register,
    login,
    refreshToken
};