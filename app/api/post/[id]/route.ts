import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import Post from "@/models/Post.model";
import { authOption } from "@/lib/auth";
import connectToDatabase from "@/lib/db";



export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOption);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const post = await Post.findById(id)
      .populate("user", "name image")
      .populate("comments.user", "name image");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const likes = post.likes as mongoose.Types.ObjectId[];
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const index = likes.findIndex((like) => like.equals(userObjectId));

    if (index !== -1) {
      likes.splice(index, 1); // Unlike
    } else {
      likes.push(userObjectId); // Like
    }

    await post.save();

    // Re-fetch with populated data
    const updatedPost = await Post.findById(id)
      .populate("user", "name image")
      .populate("comments.user", "name image");

    return NextResponse.json({ message: "Like updated", post: updatedPost }, { status: 200 });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOption);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const { text } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const post = await Post.findById(id)
      .populate("user", "name image")
      .populate("comments.user", "name image");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newComment = {
      user: new mongoose.Types.ObjectId(userId),
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Re-fetch with populated data
    const updatedPost = await Post.findById(id)
      .populate("user", "name image")
      .populate("comments.user", "name image");

    return NextResponse.json({ message: "Comment added", post: updatedPost }, { status: 200 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOption);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Ensure only the post owner can delete
    if (post.user.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden: You cannot delete this post" }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}