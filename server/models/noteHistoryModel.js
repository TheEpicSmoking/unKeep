import mongoose, { Schema } from "mongoose";

const noteHistorySchema = new mongoose.Schema({
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    delta: [Schema.Types.Mixed],
    baseVersion: {
        type: Number,
        required: true,
    },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

export default mongoose.model("NoteHistory", noteHistorySchema);