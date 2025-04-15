"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaHeart, FaComment } from "react-icons/fa";

interface Post {
  _id: string;
  user: { _id: string; name: string; image?: string };
  caption?: string;
  imageUrl?: string;
  likes: string[];
  comments: {
    user: { _id: string; name: string; image?: string };
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

const formatDate = (createdAt: string): string => {
  const now = new Date();
  const postDate = new Date(createdAt);
  const diffMs = now.getTime() - postDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    if (diffHours === 0) return "Just now";
    return `${diffHours}h`;
  }

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (postDate.getFullYear() !== now.getFullYear()) options.year = "numeric";
  return postDate.toLocaleDateString("en-US", options);
};

const ProfilePage = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showOptions, setShowOptions] = useState<Record<string, boolean>>({});
  const [followerCount , setFollowerCount ] = useState(0 )
  const [followingCount , setFollowingCount ] = useState(0)

  const userId = session?.user.id;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/post/read/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data.user.posts || []);
    } catch (err) {
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };  

  const checkFollow = async () => {
    try {
      const res = await fetch(`/api/user/follow/${userId}`);
   
      const data = await res.json();
      setFollowerCount(data.followerCount)
      setFollowingCount(data.followingCount)
    } catch (error) {
      console.error("Error checking follow:");
    }
  };

  useEffect(() => {
    if (userId) fetchPosts();
    checkFollow()
  }, [userId]);

  const hasLiked = (post: Post) => {
    return post.likes.includes(userId || "");
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/post/${postId}`, { method: "PUT" });
      if (!res.ok) return;
      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updated.post : p))
      );
    } catch (err) {
      console.error("Error liking post:", err);
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
      if (!res.ok) return;

      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updated.post : p))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setShowComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/post/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="md:ml-20 mb-20">
      {/* Profile Header */}
      <div className="flex justify-between p-5">
        <div className="flex flex-col gap-6">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src={session?.user.image || "/defaultAvatar.png"}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{session?.user.name}</h2>
            <p className="text-[#6c7075]">
              @{session?.user.name?.toLowerCase().replace(/\s/g, "")}
            </p>
            <p className="mt-3">{"No bio yet"}</p>
            <div className="flex gap-3 text-sm mt-2">
              <span className="text-white">
                {followingCount || 0}{" "}
                <span className="text-[#6c7075]">Following</span>
              </span>
              <span className="text-white">
                {followerCount || 0}{" "}
                <span className="text-[#6c7075]">Followers</span>
              </span>
            </div>
          </div>
        </div>
        <Link href="/profile/edit">
          <button className="px-3 py-2 border font-semibold hover:bg-gray-800 border-gray-500 rounded-full">
            Edit Profile
          </button>
        </Link>
      </div>

      {/* Posts */}
      <div className="mt-6">
        <div className="border-b border-gray-500 pb-5">
          <span className="p-5 hover:bg-gray-800 cursor-pointer rounded-lg">
            Posts
          </span>
        </div>
        <div>
          {posts.length ? (
            [...posts].reverse().map((post) => (
              <div
                key={post._id}
                className="py-3 px-3 border border-gray-700 flex gap-2"
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={session?.user.image || "/defaultAvatar.png"}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1 relative">
                    <span className="font-semibold">{session?.user.name}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-400">
                        {formatDate(post.createdAt)}
                      </span>

                      {/* 3 Dots Button */}
                      <button
                        onClick={() =>
                          setShowOptions((prev) => ({
                            ...prev,
                            [post._id]: !prev[post._id],
                          }))
                        }
                        className="text-gray-400 cursor-pointer hover:bg-blue-500 rounded-full hover:text-white px-2"
                      >
                        ⋯
                      </button>

                      {/* Dropdown Menu */}
                      {showOptions[post._id] && (
                        <div className="absolute cursor-pointer right-0 top-10 w-[30vw] bg-black border h-full border-gray-600  shadow-[0_0_10px_2px_rgba(255,255,255,0.3)] rounded-full z-50">
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-left cursor-pointer px-4 py-2 text-sm text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Caption and Image */}
                  {post.caption && <p className="mb-2">{post.caption}</p>}
                  {post.imageUrl && (
                    <Image
                      src={post.imageUrl}
                      alt="Post"
                      width={624}
                      height={0}
                      sizes="(max-width: 768px) 100vw, 624px"
                      className="rounded-lg mb-2 max-w-full max-h-[60vh] object-contain"
                      style={{ height: "auto" }}
                    />
                  )}

                  {/* Like & Comment */}
                  <div className="flex gap-6 mb-2">
                    <div
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1 cursor-pointer ${
                        hasLiked(post)
                          ? "text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <FaHeart size={16} />
                      <span className="text-sm">{post.likes.length}</span>
                    </div>
                    <div
                      onClick={() =>
                        setShowComments((prev) => ({
                          ...prev,
                          [post._id]: !prev[post._id],
                        }))
                      }
                      className="flex items-center gap-1 text-gray-400 hover:text-blue-500 cursor-pointer"
                    >
                      <FaComment size={16} />
                      <span className="text-sm">{post.comments.length}</span>
                    </div>
                  </div>

                  {/* Comments */}
                  {showComments[post._id] && (
                    <div>
                      <form
                        onSubmit={(e) => handleCommentSubmit(post._id, e)}
                        className="flex gap-2 mb-2"
                      >
                        <input
                          type="text"
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                          placeholder="Post your reply"
                          className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700"
                        >
                          Reply
                        </button>
                      </form>
                      <div className="space-y-1">
                        {post.comments.length ? (
                          post.comments.map((c, i) => (
                            <div
                              key={i}
                              className="text-sm border-b border-gray-500 py-2 flex items-center gap-1 text-gray-300"
                            >
                              <div className="relative w-10 h-10">
                                <Image
                                  src={c.user.image || "/defaultAvatar.png"}
                                  alt="User"
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <span className="font-semibold">
                                {c.user.name}
                              </span>
                              <span>- {c.text}</span>
                              <span className="text-gray-500 ml-1">
                                • {formatDate(c.createdAt)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No replies yet
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
