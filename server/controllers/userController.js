import User from '../models/userModel.js';
import Note from '../models/noteModel.js';
import NoteHistory from '../models/noteHistoryModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('username profilePicture');
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username profilePicture');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('username profilePicture email');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        console.log(req.body)
        const { username, email, avatar = "" } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email can\'t be empty' });
        }
        user.username = username;
        user.email = email;

        if (avatar === "remove") {
            user.profilePicture = " ";
        }

        if (req.file) {
            try {
                if (user.profilePicture) {
                    const publicId = user.profilePicture.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`Avatars/${publicId}`);
                }

                const uploadPromise = new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'Avatars' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
                });
                
                const result = await uploadPromise;
                user.profilePicture = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(400).json({ error: 'Failed to upload profile picture' });
            }
        }
        
        if (!user.isModified()) {
            return res.status(400).json({ error: 'No changes made to the profile' });
        }
        
        await user.save();
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: errors });
        }
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email or username already in use' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const Notes = await Note.find({ author: req.userId });
                const user = await User.findByIdAndDelete(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await NoteHistory.deleteMany({ noteId: { $in: Notes.map(note => note._id) } });
        for (let note of Notes) {
            if (note.collaborators && typeof req.query.migrateNotes !== 'undefined') {
            {
                for (let collaborator of note.collaborators) {
                    collaborator.user.permission = 'write';
                    note.author = collaborator.user;
                    note.collaborators = note.collaborators.filter(c => c.user !== collaborator.user);
                    await Note.findByIdAndUpdate(note._id, note);
                    return;
                }
            }
        }
            else await Note.findByIdAndDelete(note._id);
        }
        await Note.updateMany({ "collaborators.user": req.userId }, { $pull: { collaborators: { user: req.userId } } });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        RefreshToken.deleteOne({ token: req.cookies.refreshToken })
            .then(() => {
                console.log('Refresh token deleted successfully');
            })
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
