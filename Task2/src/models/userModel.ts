import mongoose from 'mongoose';

// Interface definition for the User document
export interface IUser {
    email: string;
    password?: string;
    refreshToken?: string[]; // Array of strings for multiple device sessions
    _id?: string;
}

// Mongoose Schema definition
const userSchema = new mongoose.Schema<IUser>({
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
const User = mongoose.model<IUser>('User', userSchema);

export default User;