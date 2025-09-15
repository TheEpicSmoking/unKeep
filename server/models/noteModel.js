import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        minlength: [1, "Title must be at least 1 character long"],
        maxlength: [50, "Title cannot exceed 50 characters"],
    },
    content: {
        type: String,
        maxlength: [10000, "Content cannot exceed 10000 characters"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"],
    },
    collaborators: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        permission: { type: String, enum: ['read', 'write'], required: true },
        _id: false
    }],
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
    }],
    currentVersion: {
        type: Number,
        default: 0,
    }
}, {timestamps: true, versionKey: 'currentVersion'});

// hook to prevent author from being a collaborator
noteSchema.pre('save', function(next) {
    const authorId = this.author;
    const hasAuthorAsCollaborator = this.collaborators.some(collab => collab.user.equals(authorId));
    if (hasAuthorAsCollaborator) {
        return next(new Error('Author cannot be added as collaborator'));
    }
    return next();
});

export default mongoose.model("Note", noteSchema);