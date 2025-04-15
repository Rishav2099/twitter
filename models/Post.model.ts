// models/Post.ts
import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// Create a TypeScript interface for the post
export interface IPost extends Document {
  _id: string;
  caption?: string;
  imageUrl?: string;
  user: { _id: string; name: string; image?: string };
  likes: string[] | mongoose.Types.ObjectId[];
  comments: { user: { _id: string; name: string; image?: string }; text: string; createdAt?: Date }[];
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  imageUrl: {
    type: String,
    required: false,
  },
  caption: {
    type: String,
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ]
}, {
  timestamps: true
});

// Return existing model if already created (for hot reload in dev)
const Post = models.Post || model<IPost>("Post", postSchema);
export default Post;
