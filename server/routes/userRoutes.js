import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getUserProfile, updateUserProfile, deleteUser, changePassword, getUsers, getUser} from '../controllers/userController.js';

const profileRouter = express.Router();
profileRouter.get('/', verifyToken, getUserProfile);
profileRouter.put('/', verifyToken, updateUserProfile);
profileRouter.delete('/', verifyToken, deleteUser);
profileRouter.post('/change-password', verifyToken, changePassword);

const router = profileRouter.use('/me', profileRouter);
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUser);

export default router;
