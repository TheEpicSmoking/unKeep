import Note from '../models/noteModel.js';
import NoteVersion from '../models/noteVersionModel.js';
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();

export const createNote = async (req, res) => {
    try {
        const { title, content, collaborators, tags } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        console.log('Creating note with data:', { title, content, collaborators, tags });
        const note = await Note.create({
            author: req.userId,
            title,
            content: content || '',
            collaborators: collaborators || [],
            tags: tags || [],
        });
        res.status(201).json({message: "Note created successfully", id: note._id});
    } catch (error) {
        console.error('Error creating note:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getNotes = async (req, res) => {
    console.log("Fetching notes for user:", req.userId);
    try {
        let notes = await Note.find({
            $or: [
                { author: req.userId },
                { "collaborators.user": req.userId }
            ]
        })
            .populate('author', 'username avatar')
            .populate('collaborators.user', 'username avatar')
            .sort({ createdAt: -1 });

        if (!notes || notes.length === 0) {
            return res.status(404).json({ error: 'No notes found' });
        }
        const filteredNotes = [];
        for (const note of notes) {
            const lastVersion = await NoteVersion.findOne({ noteId: note.id });
            if (lastVersion) {
                filteredNotes.push(note);
            } else {
                await Note.deleteOne({ _id: note.id });
            }
        }
;
        if (filteredNotes.length === 0) {
            return res.status(404).json({ error: 'No notes found' });
        }
        res.status(200).json(filteredNotes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('author', 'username avatar')
            .populate('collaborators.user', 'username avatar');
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (!note.author.equals(req.userId) && !note.collaborators.some(collab => collab.user.equals(req.userId))) {
            console.log('User does not have permission to view this note:', req.userId, note.author);
            return res.status(403).json({ error: 'You do not have permission to view this note' });
        }
        res.status(200).json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateNote = async (req, res, io) => {
    try {
        const { title, content, collaborators, tags, author } = req.body;
        let currentNote = await Note.findById(req.params.id);
        if (!currentNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        const oldTitle = currentNote.title || '';
        const oldContent = currentNote.content || '';
        if (!currentNote.author.equals(req.userId) && !(currentNote.collaborators.some(collab => collab.user.equals(req.userId) && collab.permission === 'write') && title === oldTitle)) {
            return res.status(403).json({ error: 'You do not have permission to update this note' });
        }
        console.log(oldContent, oldTitle);
        currentNote.title = title || oldTitle;
        currentNote.content = content || oldContent;
        currentNote.collaborators = collaborators || currentNote.collaborators;
        currentNote.tags = tags || currentNote.tags;
        currentNote.author = author || currentNote.author;
        let lastVersion = null;
        lastVersion = await NoteVersion.findOne({ noteId: req.params.id });
        if (!currentNote.isModified()) {
            return res.status(400).json({ error: 'No changes detected' });
        }
        await currentNote.validate();
        // Create root version if none exists
        if (!lastVersion) {
            const titleDiffs = dmp.diff_main("", title || '');
            dmp.diff_cleanupSemantic(titleDiffs);
            const titlePatches = dmp.patch_make("", titleDiffs);
            const contentDiffs = dmp.diff_main(oldContent, content || '');
            dmp.diff_cleanupSemantic(contentDiffs);
            const contentPatches = dmp.patch_make(oldContent, contentDiffs);
            const delta = [dmp.patch_toText(titlePatches), dmp.patch_toText(contentPatches)];
            await NoteVersion.create({
                noteId: req.params.id,
                createdBy: req.userId,
                delta: delta,
                baseVersion: 0
            });
        }
        // Create new version if title or content changed
        if ((currentNote.isModified('title') || currentNote.isModified('content')) && lastVersion) {
            req.app.set('notesDrafts')[req.params.id] = null;
            const titleDiffs = dmp.diff_main(oldTitle, title);
            dmp.diff_cleanupSemantic(titleDiffs);
            const titlePatches = dmp.patch_make(oldTitle, titleDiffs);
            const contentDiffs = dmp.diff_main(oldContent, content);
            dmp.diff_cleanupSemantic(contentDiffs);
            const contentPatches = dmp.patch_make(oldContent, contentDiffs);
            const delta = [dmp.patch_toText(titlePatches), dmp.patch_toText(contentPatches)];
            await NoteVersion.create({
                noteId: req.params.id,
                createdBy: req.userId,
                delta: delta,
                baseVersion: currentNote.currentVersion + 1
            });
            currentNote.currentVersion += 1;
        }
        await Note.findByIdAndUpdate(req.params.id, currentNote);
        io.to(req.params.id).emit("note-full-update", currentNote);
        console.log(`Note ${req.params.id} updated by user ${req.userId}`);
        res.status(200).json({message: "Note updated successfully"});
    } catch (error) {
        console.error('Error updating note:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (!note.author.equals(req.userId)) {
            return res.status(403).json({ error: 'You do not have permission to delete this note' });
        }
        await note.deleteOne();
        await NoteVersion.deleteMany({ noteId: req.params.id });
        res.status(200).json({message: "Note deleted successfully"});
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

