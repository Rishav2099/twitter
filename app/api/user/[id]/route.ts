import { NextResponse, NextRequest } from "next/server";
import User from "@/models/User.model";
import connectToDatabase from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToDatabase();
    const user = await User.findById(id).populate('posts')

    if (!user) {
      return NextResponse.json({ message: "no user found" }, { status: 404 });
    }

    return NextResponse.json({ message: "user found", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    // Parse FormData from request
    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const image = formData.get("image") as string | null;
    const { id } = await params;

    if (!image && !name) {
      return NextResponse.json(
        { message: "NO image or name was updated" },
        { status: 400 }
      );
    }

    // finding user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "no user found" }, { status: 404 });
    }

    let imageUrl = user.image;
    if (image) {
      imageUrl = await uploadImage(image);
    }

    const updateData: { name?: string; image?: string } = {};
    if (name) updateData.name = name;
    if (imageUrl !== user.image) updateData.image = imageUrl;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      { message: "profile updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.log("error updating profile", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
