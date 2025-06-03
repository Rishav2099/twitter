import { create } from "zustand";

interface Post {
  _id: string;
  caption?: string;
  imageUrl?: string;
  user: { _id: string; name: string; image?: string };
  likes: string[];
  comments: { user: { _id: string; name: string; image?: string }; text: string; createdAt?: Date }[];
  createdAt: Date;
}

interface PostStore {
  posts: Post[];
  lastFetched: number | null;
  setPosts: (posts: Post[]) => void;
  fetchPosts: () => Promise<void>;
  reset: () => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  lastFetched: null,
  setPosts: (posts) => set({ posts, lastFetched: Date.now() }),
  fetchPosts: async () => {
    try {
      const res = await fetch("/api/post/read");
      if (res.ok) {
        const data = await res.json();
        set({ posts: data.posts, lastFetched: Date.now() });
      } else {
        console.log("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },
  reset: () => set({ posts: [], lastFetched: null }),
}));