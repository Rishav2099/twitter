"use client";

import Account from "@/components/Account";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

const Page = () => {

  interface User{
    name: string;
    image: string;
    _id: string;
  }



  const [searchAll, setSearchAll] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const handleSearch = () => {
    alert("Searching!");
  };

  // fetch all users
  const fetchAllUsers = async () => {
    try {
      const res = await fetch("api/user");
      if (!res.ok) {
        console.log("failed to fetch users", res.status);
        return;
      }
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchAllUsers()
  }, [])
  

  return (
    <>
      <div className="search flex justify-center mt-5">
        <form onSubmit={handleSearch} className="relative w-[60vw] flex">
          <input
            className="text-white border w-full pr-4 pl-3 py-2 rounded-l-full border-gray-500 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 border-r-0"
            type="text"
            placeholder="Search"
          />
          <button
            type="submit"
            className="bg-gray-900 border border-gray-500 rounded-r-full px-3 flex items-center justify-center"
          >
            <FaSearch size={15} className="text-gray-400" />
          </button>
        </form>
      </div>
      <div className="options flex border-b  md:mt-3 md:ml-20  py-5 justify-around">
        <div
          onClick={() => setSearchAll((prev) => !prev)}
          className={`search cursor-pointer select-none px-5 py-2 rounded-full hover:bg-neutral-500 ${
            !searchAll ? "border" : "border-none"
          }`}
        >
          Search
        </div>
        <div className="line w-0.5  bg-white "></div>
        <div
          onClick={() => setSearchAll((prev) => !prev)}
          className={`all cursor-pointer select-none border-white px-5 py-2 rounded-full hover:bg-neutral-500 ${
            searchAll ? "border" : "border-none"
          }`}
        >
          All Users
        </div>
      </div>
      <div className="results text-center mt-5 text-white">
        {!searchAll ? (
          <div className="all-accounts flex-col flex gap-5"><p>Search results coming soon...</p></div>
        ) : (
          <div className="all-accounts flex-col flex gap-5">
          {allUsers.length > 0 ? (
              allUsers.map((user, index) => (
                <Account
                  key={index}
                  src={user.image || "/defaultAvatar.png"}
                  name={user.name}
                  id={user._id}
                />
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};
export default Page;
