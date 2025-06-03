"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import React, { useEffect, useState } from "react";
import { FaHeart, FaComment } from "react-icons/fa";

interface User {
  name: string;
  image: string;
  _id: string;
  bio?: string;
  following?: number;
  followers?: number;
  posts?: Post[];
}

interface Post {
  _id: string;
  user: { _id: string; name: string; image?: string };
  caption?: string;
  imageUrl?: string;
  likes: string[];
  comments: { user: { _id: string; name: string; image?: string }; text: string; createdAt: string }[];
  createdAt: string;
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [followerCount , setFollowerCount ] = useState(0 )
  const [followingCount , setFollowingCount ] = useState(0)

  const fetchUserAndPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkFollow = async () => {
    try {
      const res = await fetch(`/api/user/follow/${id}`);
      if (!res.ok) {
        throw new Error("Failed to check follow status");
      }
      const data = await res.json();
      setFollowed(data.followed);
      setFollowerCount(data.followerCount)
      setFollowingCount(data.followingCount)
    } catch (error) {
      console.error("Error checking follow:", error);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await fetch(`/api/user/follow/${id}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to follow/unfollow");
      }
      const data = await res.json();
      setFollowed(data.followed);
      await checkFollow();
    } catch (error) {
      console.error("Error in follow action:", error);
      alert("Failed to follow/unfollow user");
    }
  };

  const formatDate = (createdAt: string) => {
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

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/post/${postId}`, {
        method: "PUT",
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                posts: prev.posts?.map((post) =>
                  post._id === postId ? updatedPost.post : post
                ),
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
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
        setUser((prev) =>
          prev
            ? {
                ...prev,
                posts: prev.posts?.map((post) =>
                  post._id === postId ? updatedPost.post : post
                ),
              }
            : prev
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        setShowComments((prev) => ({ ...prev, [postId]: true }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const hasLiked = (post: Post) => {
    if (!user?._id || !Array.isArray(post.likes)) return false;
    return post.likes.some((like) => like.toString() === user._id);
  };

  useEffect(() => {
    fetchUserAndPosts();
    checkFollow();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full max-w-4xl md:ml-20 mb-20">
      {user ? (
        <div className="flex flex-col items-start gap-6 p-6">
          {/* Profile Image */}
          <div className="w-32 h-32 md:w-40 md:h-40 relative">
            <Image
              src={user.image || "/DefaultAvatar.png"}
              alt={user.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          {/* User Details */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <button
                onClick={handleFollow}
                className="px-4 py-1.5 border cursor-pointer border-white text-white rounded-full hover:bg-white hover:text-black transition"
              >
                {followed ? "Following" : "Follow"}
              </button>
              <Link href={`/messages`}>
                <button className="px-4 py-1.5 border cursor-pointer border-gray-500 text-white rounded-full hover:bg-gray-700 transition">
                  Message
                </button>
              </Link>
            </div>
            <p className="text-gray-400">
              @{user.name.toLowerCase().replace(/\s/g, "")}
            </p>
            <p>{user.bio || "No bio yet"}</p>
            <div className="flex gap-3 text-sm">
              <span className="text-gray-400">
                <span className="text-white">{followingCount || 0}</span> Following
              </span>
              <span className="text-gray-400">
                <span className="text-white">{followerCount || 0}</span> Followers
              </span>
            </div>
          </div>
          {/* Posts Section */}
          <div className="posts mt-6 w-full">
            <div className="option border-b border-gray-500 pb-5">
              <span className="p-5 hover:bg-gray-800 cursor-pointer rounded-lg">
                Posts
              </span>
            </div>
            <div className="post-list space-y-4">
              {user.posts && user.posts.length > 0 ? (
                [...user.posts].reverse().map((post) => (
                  <div
                    key={post._id}
                    className="py-3 px-3 rounded-lg border flex gap-2 border-gray-700"
                  >
                    <div className="user-img w-[40px] h-[40px] relative flex-shrink-0">
                      <Link href={`/user/${id}`}>
                        <Image
                          src={user?.image || "/DefaultAvatar.png"}
                          alt="Profile"
                          fill
                          className="rounded-full object-cover"
                        />
                      </Link>
                    </div>
                    <div className="content flex-1 flex flex-col">
                      <div className="user-name-date flex justify-between mb-1">
                        <Link href={`/user/${id}`}>
                          <span className="text-white font-semibold">
                            {user?.name || "Unknown User"}
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
                          className={`like flex items-center gap-1 cursor-pointer ${
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
                                        src={comment.user?.image || "/DefaultAvatar.png"}
                                        alt="User-Image"
                                        className="rounded-full object-cover"
                                        fill
                                      />
                                    </div>
                                  </span>
                                  <span className="font-semibold">
                                    {comment.user?.name || "Unknown User"}
                                  </span>
                                  <span> - {comment.text}</span>
                                  <span className="text-gray-500 ml-1">
                                    • {formatDate(comment.createdAt)}
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
                ))
              ) : (
                <p>No posts yet</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 py-6">User not found</p>
      )}
    </div>
  );
};

export default Page;