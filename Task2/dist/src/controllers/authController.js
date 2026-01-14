"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendError = (res, message, code) => {
    const errCode = code || 400;
    res.status(errCode).json({ error: message });
};
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || "secretkey";
    const exp = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
    const refreshexp = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "86400"); // 24 hours
    const accessToken = jsonwebtoken_1.default.sign({ userId: userId }, secret, { expiresIn: exp });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: userId }, secret, { expiresIn: refreshexp } // 24 hours
    );
    return { accessToken, refreshToken };
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Registration logic here
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required", 401);
    }
    try {
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            return sendError(res, "Email already exists", 409);
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const encryptedPassword = yield bcrypt_1.default.hash(password, salt);
        const newUser = new userModel_1.default({
            email,
            password: encryptedPassword,
            // If you have imgUrl in your user model, add it here. If not, remove it.
        });
        const savedUser = yield newUser.save();
        // return the user id to confirm creation.
        res.status(201).json({
            _id: savedUser._id,
            email: savedUser.email,
            message: "User registered successfully"
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return sendError(res, "Registration failed", 500);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Login logic here
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required", 400);
    }
    try {
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return sendError(res, "Invalid email or password", 401);
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password || "");
        if (!isMatch) {
            return sendError(res, "Invalid email or password", 401);
        }
        // Generate JWT tokens
        const tokens = generateToken(user._id ? user._id.toString() : "");
        // Save refresh token to database (support multiple devices)
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        yield user.save();
        // Return tokens and user info
        res.status(200).json({
            _id: user._id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return sendError(res, "Login failed", 500);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return sendError(res, "Refresh token is required", 400);
    }
    try {
        const user = yield userModel_1.default.findOne({ refreshToken: refreshToken });
        if (user) {
            user.refreshToken = user.refreshToken ? user.refreshToken.filter(t => t !== refreshToken) : [];
            yield user.save();
            res.status(200).send("Logged out successfully");
        }
        else {
            // Even if user not found, we treat it as success (token invalid anyway)
            res.status(200).send("Logged out successfully");
        }
    }
    catch (error) {
        return sendError(res, "Logout failed", 500);
    }
});
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return sendError(res, "Refresh token is required", 401);
    }
    try {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || "refreshsecret";
        jsonwebtoken_1.default.verify(refreshToken, refreshSecret, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return sendError(res, "Invalid refresh token", 403);
            }
            const user = yield userModel_1.default.findById(decoded._id);
            if (!user) {
                return sendError(res, "User not found", 403);
            }
            if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                // Token reuse detected or invalid token -> clear all tokens for security
                user.refreshToken = [];
                yield user.save();
                return sendError(res, "Invalid refresh token", 403);
            }
            // Generate new tokens
            const newTokens = generateToken(user._id ? user._id.toString() : "");
            // Replace old refresh token with new one
            user.refreshToken = user.refreshToken.filter(t => t !== refreshToken);
            user.refreshToken.push(newTokens.refreshToken);
            yield user.save();
            res.status(200).json({
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken
            });
        }));
    }
    catch (error) {
        return sendError(res, "Refresh failed", 500);
    }
});
exports.default = {
    register,
    login,
    logout,
    refreshToken
};
//# sourceMappingURL=authController.js.map