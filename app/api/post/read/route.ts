import { NextResponse } from "next/server";
import Post, {IPost} from "@/models/Post.model";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/auth";
import connectToDatabase from "@/lib/db";


export async function GET() {
  const session = await getServerSession(authOption);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase()
    const posts : IPost[]  = await Post.find()
    .populate("user", "name image")
    .populate("comments.user", "name image")
    .exec();

    if (!posts || posts.length === 0) {
        return NextResponse.json({message: 'No post found'}, {status: 404})
    }

    return NextResponse.json({message: 'Post found', posts}, {status: 200})
  } catch (error) {
    console.log("error fetching posts", error);
    return NextResponse.json({error: "failed to fetch posts"}, {status: 500})
    
  }
}
