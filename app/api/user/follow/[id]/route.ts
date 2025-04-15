import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Subscription from "@/models/Subscription.model";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOption);
    if (!session) {
      return NextResponse.json({ message: "User not logged in" }, { status: 401 });
    }

    const followingId = params.id;
    const followerId = session.user.id;

    if (followerId === followingId) {
      return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 });
    }

    const existing = await Subscription.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existing) {
      await Subscription.deleteOne({ _id: existing._id });
      return NextResponse.json({ message: "Unfollowed", followed: false });
    }

    await Subscription.create({
      follower: followerId,
      following: followingId,
    });

    return NextResponse.json({ message: "Followed", followed: true });
  } catch (error) {
    console.error("[FOLLOW_UNFOLLOW_ERROR]", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOption);
    if (!session) {
      return NextResponse.json({ message: "User not logged in" }, { status: 401 });
    }

    const followingId = params.id;
    const followerId = session.user.id;

    const existing = await Subscription.findOne({
      follower: followerId,
      following: followingId,
    });

    const followerCount = await Subscription.countDocuments({following: followingId})
    const followingCount = await Subscription.countDocuments({follower: followingId})


    return NextResponse.json({
      message: existing ? "User is followed" : "User is not followed",
      followed: !!existing,
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error("[FOLLOW_CHECK_ERROR]", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}