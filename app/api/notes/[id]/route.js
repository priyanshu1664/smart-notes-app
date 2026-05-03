import { connectDB } from "@/lib/db";
import { getUserSession } from "@/lib/getUserSession";

import { deleteNoteById, getNoteById } from "@/services/notesServices";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const session = await getUserSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Session not Provided : Unauthorised",
      });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Id is Required" },
        { status: 400 }
      );
    }

    const note = await getNoteById(id);
    if (!note) {
      console.log(error.message);
      return NextResponse.json(
        {
          success: false,
          message: "Note Not Found",
        },
        { status: 404 }
      );
    }

    await deleteNoteById(id);

    return NextResponse.json(
      { success: true, message: "Deleted Succesfully", note },
      { status: 200 }
    );
  } catch (error) {
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

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const session = await getUserSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Session not Provided : Unauthorised",
      });
    }

    const { id } = await params;
    const { title, content, tags, isPinned } = await req.json();

    if (!title && !content && !tags && isPinned === undefined) {
      return NextResponse.json(
        { success: false, message: "Atleast one field is Required" },
        { status: 400 }
      );
    }
    let tagsArray = [];
    if (tags) {
      if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean); // remove empty values
      }
    }

    const note = await getNoteById(id);
    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note Not Found",
        },
        { status: 404 }
      );
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags && tagsArray.length > 0) note.tags = tagsArray;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return NextResponse.json(
      { success: true, message: "Note Updated" },
      { status: 200 }
    );
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
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const session = await getUserSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Session not Provided : Unauthorised",
      });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Id is required" },
        { status: 400 }
      );
    }

    const note = await NotesModel.findByIdAndUpdate(
      id,
      [{ $set: { isPinned: { $not: "isPinned" } } }],
      { new: true }
    );

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pin status updated",
        isPinned: note.isPinned,
      },
      { status: 200 }
    );
  } catch (error) {
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
