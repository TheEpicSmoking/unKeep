import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from '../controllers/noteController.js';
import versionRoutes from './versionRoutes.js';


export default (io) => {
    const router = express.Router();
    router.post('/', verifyToken, createNote);
    router.get('/', verifyToken, getNotes);
    router.get('/:id', verifyToken, getNoteById);
    router.put('/:id', verifyToken, (req, res) => updateNote(req, res, io));
    router.delete('/:id', verifyToken, deleteNote);
    router.use('/:id/versions', (req, res, next) => {
        return versionRoutes(io)(req, res, next);
    });

    return router;
};
