import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import Post from "@/models/Post.model";
import { authOption } from "@/lib/auth";
import connectToDatabase from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const postId = params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const post = await Post.findById(postId)
      .populate("user", "name image")
      .populate("comments.user", "name image"); // Populate comments.user
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

    // Re-fetch with populated comments.user after save
    const updatedPost = await Post.findById(postId)
      .populate("user", "name image")
      .populate("comments.user", "name image");

    return NextResponse.json({ message: "Like updated", post: updatedPost }, { status: 200 });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOption);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const postId = params.id;
    const { text } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const post = await Post.findById(postId)
      .populate("user", "name image")
      .populate("comments.user", "name image"); // Populate existing comments.user
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

    // Re-fetch with populated comments.user to include new comment
    const updatedPost = await Post.findById(postId)
      .populate("user", "name image")
      .populate("comments.user", "name image");

    return NextResponse.json({ message: "Comment added", post: updatedPost }, { status: 200 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req :NextRequest, {params} : {params: {id: string}} ) {
  try {
    await connectToDatabase()
    const id = params.id
    const post = await Post.findByIdAndDelete(id)
    if(!post) {
      return NextResponse.json({message: 'no post found', status: 404})
    }

    return NextResponse.json({message: 'post deleted successfully'})

  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}