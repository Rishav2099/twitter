import { NextResponse } from "next/server";
import User from "@/models/User.model";

export async function GET() {
  try {
    const users = await User.find();

    // if no user found which is rare case
    if (users.length === 0) {
      return NextResponse.json({ message: "No user found", status: 404 });
    }

    return NextResponse.json({ message: "user found", users, status: 202 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
