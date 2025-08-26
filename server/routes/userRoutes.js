import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getUserProfile, updateUserProfile, deleteUser, getUsers, getUser} from '../controllers/userController.js';
import multer from 'multer';

// Use memory storage for direct upload to cloud services
const storage = multer.memoryStorage();
const upload = multer({ storage });

const profileRouter = express.Router();
profileRouter.get('/', verifyToken, getUserProfile);
profileRouter.put('/', verifyToken, upload.single('avatar'), updateUserProfile);
profileRouter.delete('/', verifyToken, deleteUser);

const router = profileRouter.use('/me', profileRouter);
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUser);

export default router;
