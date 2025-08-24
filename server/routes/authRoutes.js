import express from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { register, login, logout, refreshAccessToken, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/refresh', refreshAccessToken);
router.post('/change-password', verifyToken, changePassword);

export default router;