import { connectDB } from "@/lib/db";
import { getUserSession } from "@/lib/getUserSession";
import TaskModel from "@/models/TaskModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Added for ID validation

export const GET = async (req, { params }) => {
  try {
    await connectDB();

    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const task = await TaskModel.findOne({
      userId: session.user.id,
      _id: id,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      { message: "Fetched Success", task },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};

export const PATCH = async (req, { params }) => {
  try {
    await connectDB();

    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const {
      title,
      description, // Added description
      status,
      priority,
      date,
      dueDate,
      isRecurring,
      recurringPattern,
      estimatedMinutes, // Fixed typo from 'extimated'
      actualMinutes,
      tags,
    } = body;

    // Find task and ensure it belongs to the logged-in user
    const task = await TaskModel.findOne({ _id: id, userId: session.user.id });
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not Found" },
        { status: 404 }
      );
    }

    // Handle Date and derived Stats fields
    if (date) {
      const newDate = new Date(date);
      task.date = newDate;
      task.month = newDate.getMonth() + 1;
      task.year = newDate.getFullYear();
      // If you have a getWeek helper, use it here too
      // task.week = getWeek(newDate);
    }

    // Handle Tags (Supports both String from form or Array from TaskManager)
    if (tags) {
      task.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
    }

    // Update fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (typeof isRecurring === "boolean") task.isRecurring = isRecurring;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (recurringPattern) task.recurringPattern = recurringPattern;
    if (estimatedMinutes !== undefined)
      task.estimatedMinutes = estimatedMinutes;
    if (actualMinutes !== undefined) task.actualMinutes = actualMinutes;

    if (status) {
      task.status = status;
      if (status === "completed") {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    await task.save();

    return NextResponse.json(
      { success: true, message: "Task Updated", task },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (req, { params }) => {
  try {
    await connectDB();

    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Task ID" },
        { status: 400 }
      );
    }

    const deleted = await TaskModel.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Task not Found or Unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Task Deleted", deleted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};
