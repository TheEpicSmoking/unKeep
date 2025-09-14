import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose, { connect } from 'mongoose';
import { config } from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import historyRoutes from './routes/historyRouter.js';
import userRoutes from './routes/userRoutes.js';
import { v2 as cloudinary } from 'cloudinary';
import Delta from 'quill-delta';

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
const io = new Server(server, {
    cors: {
        origin: [ "http://192.168.1.168:5173", "http://unkeep:5173", "http://localhost:5173" ],
        credentials: true
    }
});

const notesDrafts = {};
const cursorsState = {};

app.set('notesDrafts', notesDrafts);

io.on("connection", (socket) => {
    console.log("New user connected");

    socket.on("join-note", (noteId) => {
        socket.join(noteId);
        console.log("Note drafts:", notesDrafts[noteId]);
        if (notesDrafts[noteId]) {
            console.log(`Loaded draft for note: ${noteId}`);
            //send cursorstate without the user himself
            if (cursorsState[noteId] && socket.data.user) {
                const { [socket.data.user]: _, ...otherCursors } = cursorsState[noteId];
                socket.emit("note-init", notesDrafts[noteId], otherCursors);
            } else {
                socket.emit("note-init", notesDrafts[noteId], (cursorsState[noteId] || {}));
            }
        }
        io.to(noteId).emit("user-count", io.sockets.adapter.rooms.get(noteId)?.size || 0);
        console.log(`User joined note: ${noteId}`);
    });

    socket.on("identify", ({ userId }) => {
        socket.data.user = userId;
        console.log(`User identified: ${userId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    socket.on("leave-note", (noteId) => {
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                const size = (io.sockets.adapter.rooms.get(room)?.size || 1) - 1;
                if (size === 0 && notesDrafts[room]) {
                    notesDrafts[room] = null;
                    console.log(`Cleared draft for note: ${room}`);
                }
                else{
                    socket.to(room).emit("cursor-remove", { userId: socket.data.user });
                    io.to(room).emit("user-count", size);
                }
            }
        }
        socket.leave(noteId);
        console.log(`User left note: ${noteId}`);
    });

    socket.on("note-change", (noteId, delta) => {
        notesDrafts[noteId] = new Delta(notesDrafts[noteId]).compose(new Delta(delta));
        console.log("note change event received");
        
        socket.broadcast.to(noteId).emit("note-update", delta);
    });

    socket.on("cursor-change", (noteId, cursor, user) => {
        console.log(`Cursor changed in note ${noteId} by user ${user._id}:`, cursor);
        if (!cursorsState[noteId]) cursorsState[noteId] = {};
        if (user._id) {
            cursorsState[noteId][user._id] = { user: user, range: cursor };
        }
        socket.to(noteId).emit("cursor-update", user, cursor);
    });
});

// Middlewares
app.use(cors(
    {
        origin: [ "http://192.168.1.168:5173", "http://unkeep:5173", "http://localhost:5173" ],
        credentials: true
    }
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
app.use('/api/notes', noteRoutes(io));
app.use('/api/history', historyRoutes);
app.use('/api/users', userRoutes);