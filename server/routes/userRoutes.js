import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getUserProfile, updateUserProfile, deleteUser, getUsers, getUser} from '../controllers/userController.js';
import multer from 'multer';

// Use memory storage for direct upload to cloud services
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get('/', verifyToken, getUsers);
router.get('/me', verifyToken, getUserProfile);
router.put('/me', verifyToken, upload.single('avatar'), updateUserProfile);
router.delete('/me', verifyToken, deleteUser);
router.get('/:id', verifyToken, getUser);

export default router;
