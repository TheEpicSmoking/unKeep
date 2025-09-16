import Note from '../models/noteModel.js';
import NoteVersion from '../models/noteVersionModel.js';
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
            const patchEntry = await NoteVersion.findOne({noteId: id , baseVersion: i});
            if (!patchEntry) {
                throw new Error('Patch not found for version ' + i);
            }
            //console.log("Applying patch for version", i, ":", patchEntry.delta);
            const titlePatches = dmp.patch_fromText(patchEntry.delta[0]);
            const contentPatches = dmp.patch_fromText(patchEntry.delta[1]);
            //console.log("Applying patches title:", titlePatches);
            //console.log("Applying patches content:", contentPatches);

            [patchedTitle] = dmp.patch_apply(titlePatches, patchedTitle);
            //console.log("Patched title to:", patchedTitle);
            [patchedContent] = dmp.patch_apply(contentPatches, patchedContent);
            //console.log("Patched content to:", patchedContent);
        }
        currentNote.title = patchedTitle;
        currentNote.content = patchedContent;
        currentNote.currentVersion = version;
        return currentNote;
    }
    catch (error) {
        //console.error('Error applying patch:', error);
    }
}

export const rebase = async (note, version, hardRebase=false) => {
    try {
        const newRoot = await NoteVersion.findOne({ noteId: note._id, baseVersion: version });
        if (hardRebase) {
            newRoot.createdBy = note.author;
        }
        const patchedNote = await patch(note._id, version);
        newRoot.delta = [dmp.patch_toText(dmp.patch_make("",patchedNote.title)), dmp.patch_toText(dmp.patch_make("",patchedNote.content))];
        newRoot.baseVersion = 0;
        await NoteVersion.deleteMany({ noteId: note._id, baseVersion: { $lt: version } });
        await newRoot.save();
        const otherPatches = await NoteVersion.find({ noteId: note._id, baseVersion: { $gt: version } });
        for (const patch of otherPatches) {
            patch.baseVersion = otherPatches.indexOf(patch) + 1;
            await patch.save();
        }
        note.currentVersion = otherPatches.length;
        //console.log("Rebased note to version", version, "new current version is", note.currentVersion);
    } catch (error) {
        //console.error('Error rebasing note:', error);
    }   
}

export const getNoteVersions = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (!note.author.equals(req.userId)) {
            return res.status(403).json({ error: 'You do not have permission to view this note version' });
        }
        const typeParam = req.query.type ? req.query.type : "delta";
        if (typeParam === "delta") {
            const versionList = await NoteVersion.find({ noteId })
                .sort({ baseVersion: -1 })
                .populate('createdBy', 'username')
            if (!versionList || versionList.length === 0) {
                return res.status(404).json({ error: 'No version found for this note' });
            }
            res.status(200).json(versionList);
        }
        else if (typeParam === "full") {
            return res.status(400).json({ error: "The 'type' query parameter does not support the value 'full'. Only delta retrieval is allowed via this endpoint. To get a complete version, use GET /api/notes/:id/versions/:version?type=full." });
        }
        else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }
    } catch (error) {
        //console.error('Error fetching note version:', error);
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
        if (!note.author.equals(req.userId)) {
            return res.status(403).json({ error: 'You do not have permission to view this note version' });
        }
        if (version < 0) {
            return res.status(400).json({ error: 'Invalid version number' });
        }
        const typeParam = req.query.type ? req.query.type : "delta";
        if (typeParam === "delta") {
            const versionNote = await NoteVersion.findOne({ noteId, baseVersion: version })
                .populate('createdBy', 'username')
            if (!versionNote) {
                return res.status(404).json({ error: 'Version not found' });
            }
            return await res.status(200).json(versionNote);
        }
        else if (typeParam === "full") {
            const patchedNote = await patch(noteId, version);
            if (!patchedNote) {
                return res.status(404).json({ error: 'Version not found' });
            }
            res.status(200).json(patchedNote);
        }
        else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }
    } catch (error) {
        //console.error('Error fetching note version:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const revertNote = async (req, res, io) => {
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
        await NoteVersion.deleteMany({ noteId, baseVersion: { $gt: version } });
        req.app.set('notesDrafts')[req.params.id] = null;
        io.to(req.params.id).emit("note-full-update", note, true);
        res.status(200).json({message: "Note reverted successfully", version: note.currentVersion});
    } catch (error) {
        //console.error('Error reverting note:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        //console.error('Error rebasing note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}