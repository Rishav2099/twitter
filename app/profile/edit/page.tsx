"use client";

import { PencilIcon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const Page = () => {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!session) {
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    if (imagePreview && selectedFile) {
      formData.append("image", imagePreview);
    }

    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("failed to update profile");
      }

      const data = await res.json();

      // update session with new data
      await update({
        name: data.user.name,
        image: data.user.image,
      });
      alert("profile updated successfully!");
      setSelectedFile(null);
    } catch {
      console.log("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImagePreview(session.user.image || null);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return <div>Loading ...</div>;
  }

  if (!session) return <div>Please sign in to view your profile.</div>;

  return (
    <div>
      <form
        onSubmit={(e) => handleSubmit(e, session.user.id)}
        className="flex mt-5 justify-center items-center flex-col text-white gap-3"
      >
        <div className="relative w-[100px] h-[100px]">
          <Image
            src={imagePreview || session.user.image || "/defaultAvatar.png"}
            alt="avatar"
            fill
            className="rounded-full object-cover"
          />
          <PencilIcon
            onClick={handleImageChange}
            className="text-blue-500  cursor-pointer absolute w-5 bottom-0 right-0"
          />
        </div>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="border py-2 pl-3 rounded-lg w-[30vw] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving ..." : "Save"}
        </button>
      </form>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="fixed bg-red-600 px-3 py-2 top-20 cursor-pointer right-5 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default Page;
