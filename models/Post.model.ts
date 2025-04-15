import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  _id: string;
  caption?: string;
  imageUrl?: string;
  user: string | mongoose.Types.ObjectId; // Store as ObjectId, populated as { _id, name, image }
  likes: string[] | mongoose.Types.ObjectId[];
  comments: {
    user: string | mongoose.Types.ObjectId;
    text: string;
    createdAt?: Date;
  }[];
  createdAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, trim: true },
    imageUrl: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);