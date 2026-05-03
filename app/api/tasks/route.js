import { connectDB } from "@/lib/db";
import { getUserSession } from "@/lib/getUserSession";
import TaskModel from "@/models/TaskModel";
import { getWeek } from "@/utils/date";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const status = searchParams.get("status");

    let query = { userId: session.user.id };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    }

    if (status) {
      query.status = status;
    }

    const tasks = await TaskModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Fetched Success", tasks },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        sucess: false,
        message: "Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      title,
      description,
      status,
      priority,
      date,
      dueDate,
      estimatedMinutes,
      tags,
      isRecurring,
      recurringPattern,
    } = await req.json();

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is not Provided",
        },
        { status: 400 }
      );
    }
    let newDate = "";
    if (date) newDate = date ? new Date(date) : new Date();

    const task = await TaskModel.create({
      title,
      description,
      status,
      priority,
      date: newDate,
      dueDate: dueDate || null,
      estimatedMinutes: estimatedMinutes || 0,
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || "",

      week: getWeek(newDate),
      month: newDate.getMonth() + 1,
      year: newDate.getFullYear(),

      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task Created",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
