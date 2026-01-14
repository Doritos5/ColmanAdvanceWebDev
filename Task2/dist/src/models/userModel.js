"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Mongoose Schema definition
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same email
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: [String],
        default: [], // Starts as an empty array
    }
});
// Create and export the Model
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=userModel.js.map