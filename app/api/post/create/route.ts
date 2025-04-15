import { getServerSession } from "next-auth/next";
import { authOption } from "@/lib/auth"; // Your NextAuth config
import connectToDatabase from "@/lib/db"; // Your DB connection function
import Post, { IPost } from "@/models/Post.model"; // Your Post model
import { uploadImage } from "@/lib/cloudinary"; // Your Cloudinary upload function
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.model";
import { ObjectId } from "mongoose";

// POST handler for creating a post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Parse the request body (JSON)
    const data = await req.json();
    const { caption, image } = data;

    // Validate caption (required)
    if (!caption && !image) {
      return NextResponse.json(
        { error: "Either caption or image is required" },
        { status: 400 }
      );
    }

    // Prepare post data
    const postData: Partial<IPost> = {
      user: session.user.id as object , 
      comments: [], // Initialize empty comments array
      likes: [], // Initialize empty likes array
    };

    // Handle image upload if provided
    if (image && typeof image === "string") {
      const imageUrl = await uploadImage(image); // Upload base64 image to Cloudinary
      postData.imageUrl = imageUrl;
    }

    if (caption) {
      postData.caption = caption;
    }

    // Create the post in MongoDB
    const post = await Post.create(postData);

    // Update user's posts array
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
