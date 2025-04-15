"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaImage, FaHeart, FaComment } from "react-icons/fa";
import Image from "next/image";

// Frontend-specific IPost type
interface PopulatedUser {
  _id: string;
  name: string;
  image?: string;
}

interface IPost {
  _id: string;
  caption?: string;
  imageUrl?: string;
  user: PopulatedUser;
  likes: string[];
  comments: {
    user: PopulatedUser;
    text: string;
    createdAt?: Date;
  }[];
  createdAt: Date;
}

export default function Test() {
  const { data: session } = useSession();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !image) return;

    const res = await fetch("/api/post/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, image }),
    });

    if (res.ok) {
      setCaption("");
      setImage(null);
      fetchPosts();
      alert("Post created!");
    } else {
      alert("Failed to create post");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/post/read");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        console.log(data.posts);
      } else {
        alert("Failed to fetch posts");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [session]);

  const formatDate = (createdAt: string | Date) => {
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      if (diffHours === 0) return "Just now";
      return `${diffHours}h`;
    }

    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (postDate.getFullYear() !== now.getFullYear()) {
      options.year = "numeric";
    }
    return postDate.toLocaleDateString("en-US", options);
  };

  const handleLike = async (id: string) => {
    try {
      const res = await fetch(`/api/post/${id}`, {
        method: "PUT",
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === id ? updatedPost.post : post
          )
        );
      } else {
        const errorData = await res.json();
        alert(`Failed to like post: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      alert("An error occurred while liking the post");
    }
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(`/api/post/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? updatedPost.post : post
          )
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        setShowComments((prev) => ({ ...prev, [postId]: true }));
      } else {
        const errorData = await res.json();
        alert(`Failed to add comment: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("An error occurred while adding the comment");
    }
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const hasLiked = (post: IPost) => {
    if (!session?.user?.id) return false;
    return post.likes.some((like) => like.toString() === session.user.id);
  };

  if (loading && session?.user.id) {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="pt-5 px-4 md:px-16 pb-28 md:pb-5 max-w-2xl mx-auto">
        <form onSubmit={handlePostSubmit} className="mb-6 border-b border-gray-800 pb-1">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          <div className="my-2 flex items-center justify-between px-5">
            <div onClick={triggerFileInput} className="cursor-pointer">
              {image ? (
                <Image
                  src={image}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="object-cover rounded"
                />
              ) : (
                <FaImage size={24} className="text-gray-700 hover:text-gray-200" />
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post
            </button>
          </div>
        </form>
        <div className="space-y-4">
          {[...posts].reverse().map((post) => (
            <div
              key={post._id}
              className="py-3 px-3 rounded-lg border flex gap-2 border-gray-700"
            >
              <div className="user-img w-[40px] h-[40px] relative flex-shrink-0">
                <Link href={`/user/${post.user._id}`}>
                  <Image
                    src={post.user.image || "/DefaultAvatar.png"}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </Link>
              </div>
              <div className="content flex-1 flex flex-col">
                <div className="user-name-date flex justify-between mb-1">
                  <Link href={`/user/${post.user._id}`}>
                    <span className="text-white font-semibold">
                      {post.user.name || "Unknown User"}
                    </span>
                  </Link>
                  <span className="text-gray-400 text-sm pr-3">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white mb-2">{post.caption}</p>
                  {post.imageUrl && (
                    <Image
                      src={post.imageUrl}
                      alt="Post image"
                      width={624}
                      height={0}
                      style={{ width: "100%", height: "auto" }}
                      sizes="(max-width: 768px) 100vw, 624px"
                      className="rounded-lg mb-2 max-w-full max-h-[60vh] object-contain"
                    />
                  )}
                </div>
                <div className="engagement flex gap-6 mb-2">
                  <div
                    onClick={() => handleLike(post._id)}
                    className={`like closesocket flex items-center gap-1 cursor-pointer ${
                      hasLiked(post) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <FaHeart size={16} />
                    <span className="text-sm">{post.likes.length}</span>
                  </div>
                  <div
                    onClick={() => toggleComments(post._id)}
                    className="comment flex items-center gap-1 text-gray-400 hover:text-blue-500 cursor-pointer"
                  >
                    <FaComment size={16} />
                    <span className="text-sm">{post.comments.length}</span>
                  </div>
                </div>
                {showComments[post._id] && (
                  <div className="comment-section">
                    <form
                      onSubmit={(e) => handleCommentSubmit(post._id, e)}
                      className="flex items-center gap-2 mb-2"
                    >
                      <input
                        type="text"
                        value={commentInputs[post._id] || ""}
                        onChange={(e) => handleCommentChange(post._id, e.target.value)}
                        placeholder="Post your reply"
                        className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-sm hover:bg-blue-700"
                      >
                        Reply
                      </button>
                    </form>
                    <div className="comments space-y-1">
                      {post.comments.length > 0 ? (
                        post.comments.map((comment, index) => (
                          <div
                            key={index}
                            className="text-sm border-b border-gray-500 py-2 flex items-center gap-1 text-gray-300"
                          >
                            <span>
                              <div className="relative w-[40px] h-[40px]">
                                <Image
                                  src={comment.user.image || "/DefaultAvatar.png"}
                                  alt="User-Image"
                                  className="rounded-full object-cover"
                                  fill
                                />
                              </div>
                            </span>
                            <span className="font-semibold">
                              {comment.user.name || "Unknown User"}
                            </span>
                            <span> - {comment.text}</span>
                            <span className="text-gray-500 ml-1">
                              • {formatDate(comment.createdAt || new Date())}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No replies yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-800 to-black flex flex-col items-center justify-between px-4 py-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
          Welcome to Twitter
        </h1>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
          Twitter is your go-to platform for real-time conversations, sharing ideas, and staying connected with the world. Tweet your thoughts, follow trends, and join the global community.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg">
              Log In
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-green-700 transition-colors duration-300 shadow-lg">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
      <footer className="text-gray-500 text-sm">
        Made by Rishav
      </footer>
    </div>
  );
}