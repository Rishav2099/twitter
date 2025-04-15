import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Subscription from "@/models/Subscription.model";
import mongoose from "mongoose";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOption);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not logged in" }, { status: 401 });
    }

    const { id: followingId } = await params;
    const followerId = session.user.id;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (followerId === followingId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    const existing = await Subscription.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existing) {
      await Subscription.deleteOne({ _id: existing._id });
      return NextResponse.json({ message: "Unfollowed", followed: false }, { status: 200 });
    }

    await Subscription.create({
      follower: followerId,
      following: followingId,
    });

    return NextResponse.json({ message: "Followed", followed: true }, { status: 201 });
  } catch (error) {
    console.error("[FOLLOW_UNFOLLOW_ERROR]", error);
    return NextResponse.json({ error: "Failed to process follow/unfollow" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOption);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not logged in" }, { status: 401 });
    }

    const { id: followingId } = await params;
    const followerId = session.user.id;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const existing = await Subscription.findOne({
      follower: followerId,
      following: followingId,
    });

    const followerCount = await Subscription.countDocuments({ following: followingId });
    const followingCount = await Subscription.countDocuments({ follower: followingId });

    return NextResponse.json({
      message: existing ? "User is followed" : "User is not followed",
      followed: !!existing,
      followerCount,
      followingCount,
    }, { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_CHECK_ERROR]", error);
    return NextResponse.json({ error: "Failed to check follow status" }, { status: 500 });
  }
}