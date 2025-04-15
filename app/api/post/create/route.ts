import { getServerSession } from "next-auth/next";
import { authOption } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Post, { IPost } from "@/models/Post.model";
import { uploadImage } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.model";



export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Parse JSON body
    const data = await req.json();
    const { caption, image } = data as { caption?: string; image?: string };

    // Validate inputs
    if (!caption?.trim() && !image?.trim()) {
      return NextResponse.json(
        { error: "Either a non-empty caption or image is required" },
        { status: 400 }
      );
    }

    // Prepare post data
    const postData: Partial<IPost> = {
      user: ObjectId, // string (ObjectId)
      comments: [],
      likes: [],
    };

    // Handle image upload
    if (image?.trim()) {
      try {
        const imageUrl = await uploadImage(image); // Assumes base64 string
        postData.imageUrl = imageUrl;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 400 }
        );
      }
    }

    if (caption?.trim()) {
      postData.caption = caption.trim();
    }

    // Create post
    const post = await Post.create(postData);

    // Update user's posts
    await User.findByIdAndUpdate(
      session.user.id,
      { $push: { posts: post._id } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Post created", post },
      { status: 201 }
    );
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}