const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const postRoutes = require('./routes/postRoute')
const commentRoutes = require('./routes/commentRoutes')


const app = express();

// ---------- Middleware ----------
app.use(express.json());

// ---------- MongoDB Connection ----------
const { MONGODB_URI, PORT } = process.env;

mongoose
    .connect(MONGODB_URI, {
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

// ---------- Routes ----------
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
