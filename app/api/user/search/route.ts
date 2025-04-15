import connectToDatabase from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.model";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name")?.trim();

    if (!name) {
      return NextResponse.json({ message: "Name query required", users: [] }, { status: 400 });
    }

    const users = await User.find({
      name: { $regex: `^${name}`, $options: "i" }, // Starts-with match for better UX
    })
      .select("name image _id")
      .limit(10); // Limit results for performance

    return NextResponse.json({
      message: users.length ? "Users found" : "No users found",
      users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ message: "Internal server error", users: [] }, { status: 500 });
  }
}