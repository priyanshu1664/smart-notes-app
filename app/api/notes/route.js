import { connectDB } from "@/lib/db";
import { getUserSession } from "@/lib/getUserSession";

import { createNote, getUserNotes, uniqueSlug } from "@/services/notesServices";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const session = await getUserSession();
    //console.log("Get Session", session);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const notes = await getUserNotes(session.user.id);
    //console.log(notes);
    return NextResponse.json({ success: true, notes }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
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
      return NextResponse.json({
        success: false,
        message: "Session not Provided : Unauthorised",
      });
    }

    const { title, content, tags } = await req.json();

    console.log(title, content);

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "All Fields are Required",
        },
        { status: 400 }
      );
    }
    let slug;

    if (title) {
      slug = await uniqueSlug(title);
    }

    let tagsArray = [];
    if (tags) {
      tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
    const note = await createNote({
      title,
      content,
      tagsArray,
      slug,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.log(error.message);
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
