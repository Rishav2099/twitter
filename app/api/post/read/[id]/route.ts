import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.model";
import connectToDatabase from "@/lib/db";

export async function GET (req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
   try {
    await connectToDatabase()
     const {id} = await params
     const user  = await User.findById(id).populate('posts')
  
     
 
     // check if user exist
     if (!user) {
        return NextResponse.json({ message: "No user found" }, { status: 404 });
      }

      return NextResponse.json({ message: "User found", user }, { status: 200 });
   } catch (error) {
    console.error("[USER_FETCH_ERROR]", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    
   }
}