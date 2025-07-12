import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getNoteHistory, revertNote, rebaseNote, getNoteVersion } from '../controllers/historyController.js';

const router = express.Router();

router.get('/:id', verifyToken, getNoteHistory);
router.get('/:id/:version', verifyToken, getNoteVersion);
router.post('/:id/revert/:version', verifyToken, revertNote);
router.post('/:id/rebase/:version', verifyToken, rebaseNote);

export default router;