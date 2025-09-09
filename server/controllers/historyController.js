import Note from '../models/noteModel.js';
import NoteHistory from '../models/noteHistoryModel.js';
import DiffMatchPatch from 'diff-match-patch';
const dmp = new DiffMatchPatch();

async function patch(id, version){
    try {
        if (!id || version < 0) {
            throw new Error('invalid arguments');
        }
        const currentNote = await Note.findById(id)
            .populate('author', 'username')
            .populate('collaborators.user', 'username');
        if (!currentNote) {
            throw new Error('Note not found');
        }

        let patchedTitle = "";
        let patchedContent = "";   

        for (let i = 0; i <= version; i++) {
            const patchEntry = await NoteHistory.findOne({noteId: id , baseVersion: i});
            if (!patchEntry) {
                throw new Error('Patch not found for version ' + i);
            }
            console.log("Applying patch for version", i, ":", patchEntry.delta);
            const titlePatches = dmp.patch_fromText(patchEntry.delta[0]);
            const contentPatches = dmp.patch_fromText(patchEntry.delta[1]);
            console.log("Applying patches title:", titlePatches);
            console.log("Applying patches content:", contentPatches);

            [patchedTitle] = dmp.patch_apply(titlePatches, patchedTitle);
            console.log("Patched title to:", patchedTitle);
            [patchedContent] = dmp.patch_apply(contentPatches, patchedContent);
            console.log("Patched content to:", patchedContent);
        }
        currentNote.title = patchedTitle;
        currentNote.content = patchedContent;
        currentNote.currentVersion = version;
        return currentNote;
    }
    catch (error) {
        console.error('Error applying patch:', error);
    }
}

export const getNoteHistory = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (!note.author.equals(req.userId) && !note.collaborators.some(collab => collab.user.equals(req.userId))) {
            return res.status(403).json({ error: 'You do not have permission to view this note history' });
        }
        const version = req.query.v ? parseInt(req.query.v) : -1;
        if (0 <= version && version <= note.currentVersion) {
            const versionNote = await NoteHistory.findOne({ noteId, baseVersion: version })
                .populate('createdBy', 'username')
            if (!versionNote) {
                return res.status(404).json({ error: 'No root found for this note' });
            }
            return await res.status(200).json(versionNote);
        }
        const history = await NoteHistory.find({ noteId })
            .sort({ baseVersion: -1 })
            .populate('createdBy', 'username')
        if (!history || history.length === 0) {
            return res.status(404).json({ error: 'No history found for this note' });
        }
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching note history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getNoteVersion = async (req, res) => {
    try {
        const noteId = req.params.id;
        const version = req.params.version;
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (!note.author.equals(req.userId) && !note.collaborators.some(collab => collab.user.equals(req.userId))) {
            return res.status(403).json({ error: 'You do not have permission to view this note version' });
        }
        if (version < 0) {
            return res.status(400).json({ error: 'Invalid version number' });
        }
        const patchedNote = await patch(noteId, version);
        if (!patchedNote) {
            return res.status(404).json({ error: 'Version not found' });
        }
        res.status(200).json(patchedNote);
    } catch (error) {
        console.error('Error fetching note version:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const revertNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        let note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (!note.author.equals(req.userId)) {
            return res.status(403).json({ error: 'You do not have permission to revert this note' });
        }
        const version = req.params.version;
        if (version < 0 || version >= note.currentVersion) {
            return res.status(400).json({ error: 'Invalid version number' });
        }
        note = await patch(noteId, version);
        if (!note) {
            return res.status(404).json({ error: 'Version not found' });
        }
        await note.save();
        await NoteHistory.deleteMany({ noteId, baseVersion: { $gt: version } });
        res.status(200).json({message: "Note reverted successfully", version: note.currentVersion});
    } catch (error) {
        console.error('Error reverting note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const rebase = async (note, version, hardRebase=false) => {
    try {
        const newRoot = await NoteHistory.findOne({ noteId: note._id, baseVersion: version });
        if (hardRebase) {
            newRoot.createdBy = note.author;
        }
        const patchedNote = await patch(note._id, version);
        newRoot.delta = [dmp.patch_toText(dmp.patch_make("",patchedNote.title)), dmp.patch_toText(dmp.patch_make("",patchedNote.content))];
        newRoot.baseVersion = 0;
        await NoteHistory.deleteMany({ noteId: note._id, baseVersion: { $lt: version } });
        await newRoot.save();
        const otherPatches = await NoteHistory.find({ noteId: note._id, baseVersion: { $gt: version } });
        for (const patch of otherPatches) {
            patch.baseVersion = otherPatches.indexOf(patch) + 1;
            await patch.save();
        }
        note.currentVersion = otherPatches.length;
        console.log("Rebased note to version", version, "new current version is", note.currentVersion);
    } catch (error) {
        console.error('Error rebasing note:', error);
    }   
}

export const rebaseNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        const version = req.params.version;
        if (version <= 0 || version > note.currentVersion) {
            return res.status(400).json({ error: 'Invalid version number' });
        }
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (!note.author.equals(req.userId)) {
            return res.status(403).json({ error: 'You do not have permission to rebase this note' });
        }
        await rebase(note, version);
        await note.save();
        res.status(200).json({message: "Note rebased successfully", version: note.currentVersion});
    }
    catch (error) {
        console.error('Error rebasing note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}