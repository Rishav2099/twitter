"use client";

import Account from "@/components/Account";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface User {
  name: string;
  image: string;
  _id: string;
}

const Page = () => {
  const [searchAll, setSearchAll] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) {
      setError("Please enter a name to search");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/user/search?name=${encodeURIComponent(searchName)}`
      );
      if (!res.ok) {
        throw new Error("Error fetching users");
      }
      const data = await res.json();
      console.log(data)
      setUsers(data.users || []);
      if (!data.users.length) {
        setError("No users found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div>
      <div className="search flex justify-center mt-5">
        <form onSubmit={handleSearch} className="relative w-[60vw] flex">
          <input
            className="text-white border w-full pr-4 pl-3 py-2 rounded-l-full border-gray-500 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 border-r-0"
            type="text"
            placeholder="Search"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gray-900 border border-gray-500 rounded-r-full px-3 flex items-center justify-center"
          >
            <FaSearch size={15} className="text-gray-400" />
          </button>
        </form>
      </div>
      <div className="options flex border-b md:mt-3 md:ml-20 py-5 justify-around">
        <div
          onClick={() => setSearchAll(false)}
          className={`search cursor-pointer select-none px-5 py-2 rounded-full hover:bg-neutral-500 ${
            !searchAll ? "border" : "border-none"
          }`}
        >
          Search
        </div>
        <div className="line w-0.5 bg-white"></div>
        <div
          onClick={() => setSearchAll(true)}
          className={`all cursor-pointer select-none border-white px-5 py-2 rounded-full hover:bg-neutral-500 ${
            searchAll ? "border" : "border-none"
          }`}
        >
          All Users
        </div>
      </div>
      <div className="results text-center mt-5 text-white">
        {loading && (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-white" />
            <p>Loading...</p>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!searchAll ? (
          <div className="all-accounts flex-col flex gap-5">
            {users.length > 0 && !loading
              ? users.map((user) => (
                  <Account
                    key={user._id}
                    src={user.image || "/DefaultAvatar.png"}
                    name={user.name}
                    id={user._id}
                  />
                ))
              : !loading && !error && <p>No users found</p>}
          </div>
        ) : (
          <div className="all-accounts flex-col flex gap-5 mb-12">
            {allUsers.length > 0 && !loading
              ? allUsers.map((user) => (
                  <Account
                    key={user._id}
                    src={user.image || "/defaultAvatar.png"}
                    name={user.name}
                    id={user._id}
                  />
                ))
              : !loading && <p>No users found</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
