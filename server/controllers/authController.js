import User from '../models/userModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_JWT_SECRET,
        { expiresIn: '14d' }
    );
    return { accessToken, refreshToken };
}

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Registration data:', { username, email, password });
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: errors });
        }
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email or username already in use' });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        let user = null;
        if (emailOrUsername.includes('@')) {
            user = await User.findOne({
                email: emailOrUsername
            });
        }
        else {
            user = await User.findOne({
                username: emailOrUsername
            });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid Username or Email' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const { accessToken, refreshToken } = generateToken(user);
        await RefreshToken.findOneAndUpdate({userId: user._id}, {
            userId: user._id,
            token: refreshToken,
        },
            { upsert: true, new: true }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            partitioned: process.env.NODE_ENV === 'production',
            maxAge: 14 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: 'Login successful',
            accessToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            partitioned: process.env.NODE_ENV === 'production',
        });
        RefreshToken.deleteOne({ token: req.cookies.refreshToken })
            .then(() => {
                console.log('Refresh token deleted successfully');
            })
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const refreshAccessToken = async (req, res) => {
    try {
        let { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ error: 'No refresh token provided' });
        }
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
        if (!tokenDoc) {
            return res.status(403).json({ error: 'Refresh token invalid or expired' });
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ error: 'Refresh token invalid or expired' });
        }
        const { accessToken } = generateToken(user);
        res.status(200).json({accessToken});
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}