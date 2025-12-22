import mongoose from 'mongoose'
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    }
});

export default mongoose.model('Post', postSchema);