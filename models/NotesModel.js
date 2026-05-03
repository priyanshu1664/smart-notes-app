import mongoose, { Types } from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 50 },

    content: { type: String, required: true, trim: true, maxlength: 150 },

    isPinned: { type: Boolean, default: false },

    tags: { type: [String], default: [] },

    slug: { type: String, required: true, unique: true },

    userId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const NotesModel =
  mongoose.models.Notes || mongoose.model("Notes", NotesSchema);

export default NotesModel;
