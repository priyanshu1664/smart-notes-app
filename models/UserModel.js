import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    name: { type: String, required: true },
    photo: { type: String, default: "" },
    bio: { type: String },
    isVerified: {
      type: Boolean,
      default: false,
    },

    noteCount: {
      type: Number,
      default: 0,
    },
    pinnedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notes" }],
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
