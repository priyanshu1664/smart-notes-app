import { connectDB } from "@/lib/db";
import { getNoteBySlug } from "@/services/notesServices";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug is required",
        },
        { status: 400 }
      );
    }
    const note = await getNoteBySlug(slug);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note Not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Note Found",
        note,
      },
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
