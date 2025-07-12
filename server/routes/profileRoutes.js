import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getUserProfile, updateUserProfile, deleteUser, changePassword } from '../controllers/userController.js';

const router = express.Router();

router.get('/', verifyToken, getUserProfile);
router.put('/', verifyToken, updateUserProfile);
router.delete('/', verifyToken, deleteUser);
router.post('/change-password', verifyToken, changePassword);

export default router;
