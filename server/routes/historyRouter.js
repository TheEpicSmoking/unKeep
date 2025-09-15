import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getNoteHistory, revertNote, rebaseNote, getNoteVersion } from '../controllers/historyController.js';

export default (io) => {
    const router = express.Router();
    router.get('/:id', verifyToken, getNoteHistory);
    router.get('/:id/:version', verifyToken, getNoteVersion);
    router.post('/:id/revert/:version', verifyToken,  (req, res) => revertNote(req, res, io));
    router.post('/:id/rebase/:version', verifyToken, rebaseNote);
    return router;
};
