import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose, { connect } from 'mongoose';
import { config } from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import historyRoutes from './routes/historyRouter.js';
import profileRoutes from './routes/profileRoutes.js';
import { getUsers, getUser } from './controllers/userController.js';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
config();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || null;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const server = createServer(app);

// Middlewares
app.use(cors(
    {
        origin: [ "http://192.168.1.168:5173", "http://unkeep:5173", "http://localhost:5173" ],
        credentials: true
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//logger middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

console.log(MONGO_URI);
mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile', profileRoutes);
app.get('/api/users', getUsers);
app.get('/api/users/:id', getUser);