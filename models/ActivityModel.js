import Notes from "@/app/notes/page";
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: {
      type: String,
      reqired: true,
      enum: [
        "CREATE_NOTE",
        "UPDATE_NOTE",
        "DELETE_NOTE",
        "PIN_NOTE",
        "UNPIN_NOTE",
        "LOGIN",
        "UPDATE_PROFILE",
      ],
    },
    notesId: { type: mongoose.Schema.Types.ObjectId, ref: "Notes" },
    metadata: {
      type: Object,
      default: {},
    },

    ipAddress: String,
  },
  { timestamps: true }
);

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
