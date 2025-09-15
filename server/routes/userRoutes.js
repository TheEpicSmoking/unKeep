import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getMyUser, updateMyUser, deleteMyUser, getUsers, getUser} from '../controllers/userController.js';
import multer from 'multer';

// Set up multer for handling file uploads, store uploaded files as buffer in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get('/', verifyToken, getUsers);
router.get('/me', verifyToken, getMyUser);
router.put('/me', verifyToken, upload.single('avatar'), updateMyUser); // Passing 'avatar' as the field name for the uploaded file
router.delete('/me', verifyToken, deleteMyUser);
router.get('/:id', verifyToken, getUser);

export default router;
