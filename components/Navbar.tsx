"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaHome, FaComment, FaPlusSquare, FaSearch } from "react-icons/fa";
import Image from "next/image";

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const hideNavbarPaths = ["/login", "/register"];

  // Hide Navbar if not logged in or on login/register pages
  if (!session || hideNavbarPaths.includes(pathname)) {
    return null;
  }

  const navItems = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/search", icon: FaSearch, label: "Search" },
    { href: "/create", icon: FaPlusSquare, label: "Create" },
    { href: "/messages", icon: FaComment, label: "Messages" },
    {
      href: "/profile",
      icon: () => (
        <div className="relative w-[22px] h-[22px]">
          <Image
            src={session.user.image || "/DefaultAvatar.png"}
            alt="Profile"
            fill
            className="rounded-full object-cover w-full h-full"
          />
        </div>
      ),
      label: "Profile",
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 bg-opacity-5 bg-[#0000006e] backdrop-blur-sm border-b border-gray-800 z-50 h-[var(--mobile-nav-height)] flex items-center justify-between px-4">
        <div className="text-xl font-bold">
          <span>Logo</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <nav className="hidden md:block fixed left-0 top-0 h-screen w-[var(--desktop-nav-width)] bg-black border-r border-gray-800 z-40">
        <div className="flex flex-col items-center h-full py-8">
          <Link
            href="/"
            className="text-2xl font-bold mb-12 text-white hover:text-gray-300 transition-colors"
          >
            Logo
          </Link>
          <ul className="flex flex-col items-center gap-6 w-full px-2">
            {navItems.map((item) => (
              <li key={item.href} className="w-full">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center p-3 rounded-lg transition-colors w-full ${
                    pathname === item.href
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon size={22} />
                  <span className="text-xs mt-2">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 h-[var(--mobile-nav-height)] z-40">
        <ul className="flex justify-around h-full relative">
          {navItems.map((item) => (
            <li key={item.href} className="flex-1 flex justify-center">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  pathname === item.href ? "text-white" : "text-gray-400"
                }`}
              >
                {item.label === "Profile" ? (
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={session.user.image || "/DefaultAvatar.png"}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <item.icon size={20} />
                )}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;