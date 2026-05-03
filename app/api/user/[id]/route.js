import { getUserById } from "@/services/userServices";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const user = await getUserById(id);

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
