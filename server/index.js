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
import { getUsers } from './controllers/userController.js';

// Load environment variables
config();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || null;

const app = express();
const server = createServer(app);

// Middlewares
app.use(cors(
    {
        origin: 'http://localhost:5173',
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