import mongoose from 'mongoose';

// Interface defining the structure of a Post document
export interface IPost {
    title: string;
    content: string;
    senderId: mongoose.Types.ObjectId; // Reference to a User ID
}

const postSchema = new mongoose.Schema<IPost>({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Establishes the relationship with the User model
        required: true
    }
});

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;