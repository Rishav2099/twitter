import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string; // Optional for OAuth users
  name?: string;
  image?: string;
  posts?: Types.ObjectId[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true 
    },
    password: { 
      type: String, 
      select: false // Never return password in queries
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      }
    ],
    bio: {type: String},
    name: { type: String },
    image: { type: String }
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre<IUser>("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password!);
};

// Prevent duplicate model compilation in dev
export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);