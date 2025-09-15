import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getNoteVersions,  getNoteVersion, revertNote, rebaseNote } from '../controllers/versionController.js';

export default (io) => (req, res, next) => {
    const router = express.Router({ mergeParams: true });
    router.get('/', verifyToken, getNoteVersions);
    router.get('/:version', verifyToken, getNoteVersion);
    router.post('/:version/revert', verifyToken,  (req, res) => revertNote(req, res, io));
    router.post('/:version/rebase', verifyToken, rebaseNote);
    return router(req, res, next);
};
