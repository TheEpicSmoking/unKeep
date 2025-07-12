import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from '../controllers/noteController.js';

const router = express.Router();

router.post('/', verifyToken, createNote);
router.get('/', verifyToken, getNotes);
router.get('/:id', verifyToken, getNoteById);
router.put('/:id', verifyToken, updateNote);
router.delete('/:id', verifyToken, deleteNote);

export default router;