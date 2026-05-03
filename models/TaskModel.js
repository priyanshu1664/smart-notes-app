import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low", "urgent"],
      default: "medium",
    },

    date: { type: Date, required: true },

    dueDate: { type: Date },
    completedAt: Date,

    estimatedMinutes: Number,
    actualMinutes: Number,

    tags: { type: [String], default: [] },

    isRecurring: { type: Boolean, default: false },
    recurringPattern: { type: String, default: "" },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    week: Number,
    month: Number,
    year: Number,
  },
  { timestamps: true }
);

const TaskModel = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default TaskModel;
