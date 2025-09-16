import User from '../models/userModel.js';
import Note from '../models/noteModel.js';
import NoteVersion from '../models/noteVersionModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import { rebase } from './versionController.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const getUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.trim().length < 2) {
            return res.status(400).json([]);
        }
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
            ]
        }).limit(50).select('username avatar');

        const sortedUsers = users.sort((a, b) => {
            const aStartsWith = a.username.toLowerCase().startsWith(query.toLowerCase());
            const bStartsWith = b.username.toLowerCase().startsWith(query.toLowerCase());
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return a.username.localeCompare(b.username);
        });

        if (!sortedUsers || sortedUsers.length === 0) {
            return res.status(404).json([]);
        }
        res.status(200).json(sortedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username avatar');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getMyUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('username avatar email');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateMyUser = async (req, res) => {
    try {
        console.log(req.body)
        const { username, email, avatar = null } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email can\'t be empty' });
        }
        user.username = username;
        user.email = email;
        //Delete previous avatar if changed or removed
        if (user.avatar && avatar === "" || (req.file && req.file.fieldname === "avatar")) {
            console.log(user.avatar);
            try {
                const publicId = user.avatar.split('/').pop().split('.')[0];
                console.log('Deleting previous avatar with public ID:', publicId);
                await cloudinary.uploader.destroy(`Avatars/${publicId}`);
                user.avatar = "";
            } catch (error) {
                console.error('Error deleting previous avatar:', error);
                return res.status(500).json({ error: 'Failed to delete previous avatar' });
            }
        }
        // Upload new avatar if provided
        if (req.file && req.file.fieldname === "avatar") {
            try {
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
                user.avatar = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(400).json({ error: 'Failed to upload avatar' });
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
                avatar: user.avatar
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

export const deleteMyUser = async (req, res) => {
    try {
        const Notes = await Note.find({ author: req.userId });
                const user = await User.findByIdAndDelete(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        for (let note of Notes) {
            if (note.collaborators && typeof req.query.migrateNotes !== 'undefined') {
            {
                for (let collaborator of note.collaborators) {
                    collaborator.user.permission = 'write';
                    note.author = collaborator.user;
                    note.collaborators = note.collaborators.filter(c => c.user !== collaborator.user);
                    rebase(note, note.currentVersion, true);
                    note.currentVersion = 0;
                    await Note.findByIdAndUpdate(note._id, note);
                    return;
                }
            }
        }
            else {
                await NoteVersion.deleteMany({ noteId: { $in: Notes.map(note => note._id) } });
                await Note.findByIdAndDelete(note._id);
            }
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
