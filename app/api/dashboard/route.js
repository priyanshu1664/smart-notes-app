import { connectDB } from "@/lib/db";
import { getUserSession } from "@/lib/getUserSession";
import TaskModel from "@/models/TaskModel";
import NotesModel from "@/models/NotesModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectDB();
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const statsResult = await TaskModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$dueDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const todayTasks = await TaskModel.find({
      userId,
      date: { $gte: todayStart, $lt: tomorrow },
    }).lean();

    const recentNotes = await NotesModel.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean();

    const notesCount = await NotesModel.countDocuments({ userId });

    const summary = statsResult[0] || {
      total: 0,
      completed: 0,
      overdue: 0,
    };

    const latestTasks = await TaskModel.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean();

    const latestNotes = await NotesModel.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean();

    // Map them to a unified "Activity" format
    const activity = [
      ...latestTasks.map((t) => ({
        id: t._id,
        type: "task",
        title: t.title,
        action: t.status === "completed" ? "marked complete" : "task updated",
        time: t.updatedAt,
        status: t.status,
      })),
      ...latestNotes.map((n) => ({
        id: n._id,
        type: "note",
        title: n.title,
        action: "note added",
        time: n.updatedAt,
      })),
    ]
      .sort((a, b) => b.time - a.time)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      username: session.user.name?.split(" ")[0] || "User",
      stats: {
        total: summary.total,
        completed: summary.completed,
        pending: summary.total - summary.completed,
        overdue: summary.overdue,
        notesCount,
      },
      recentActivity: activity,
      todayTasks,
      recentNotes,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};
