'use client'

import { ObjectId } from "mongoose";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";

const Account = ({src, name, id} : {src: string; name: string, id: string}) => {
 const {data: sesseion} = useSession()
 const userId = sesseion?.user.id
  
  return (
    <Link href={id == userId ? '/profile' : `user/${id.toString()}`}>
    <div className="md:ml-24 md:w-[80vw] mx-auto  account cursor-pointer hover:bg-black hover:border bg-neutral-900 p-2 w-[90vw] rounded-lg flex gap-2 items-center ml-5">
      <div className="relative w-[50px] h-[50px]">

      <Image
        alt="avatar"
        className="rounded-full object-cover"
        src={src}
        fill
        />
        </div>
      <p className="font-bold text-xl">{name}</p>
    </div>
    </Link>
  );
};

export default Account;
