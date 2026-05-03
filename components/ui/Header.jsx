"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { useSelector } from "react-redux";
import ProfileDropdown from "./header/ProfileDropdown";
import { Layout } from "lucide-react";
function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useSelector((s) => s.user);

  console.log("HEADER SESSION:", session);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    } else if (
      !savedTheme &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      // Respect system preference if no manual setting exists
      setDarkMode(true);
    }
  }, []);

  // 2. Apply theme logic
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode, mounted]);

  if (!mounted)
    return <div className="h-16 w-full border-b border-slate-200" />;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800 transition-colors duration-300">
      <div className="mx-auto flex gap-4 h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <div className="h-9 px-3 rounded-lg bg-indigo-600 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
            <Layout className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-bold text-lg">SmartNotesApp</span>
          </div>
        </Link>
        {user && (
          <div className="hidden flex-1 px-8 lg:flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full rounded-full bg-slate-100 dark:bg-slate-800 
              text-slate-700 dark:text-slate-200
              py-2 pl-4 pr-3 text-sm outline-none
              focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

        {user && (
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <Link
                href="/dashboard"
                className="hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/analytics"
                className="hover:text-indigo-600 transition-colors"
              >
                Analytics
              </Link>
            </nav>
          </div>
        )}

        {/* Right Section */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Add Note Button */}
            <Link
              href="/notes/add-note"
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-all active:scale-95 shadow-md shadow-indigo-500/10"
            >
              <FaPlus className="text-xs" />
              <span className="hidden sm:inline">Add Note</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full 
            bg-slate-100 dark:bg-slate-800 
            text-slate-600 dark:text-slate-300
            hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:rotate-12"
            >
              {darkMode ? (
                <FiSun size={20} className="text-yellow-400" />
              ) : (
                <FiMoon size={20} />
              )}
            </button>
          </div>
        )}
        <div>
          {" "}
          {/* Profile - Using Next.js Image for optimization */}
          {!user ? (
            <div className="flex gap-2">
              <Link
                href={"/signup"}
                className="border border-purple-900 py-1 px-3 rounded-lg hover:bg-purple-900 hover:text-white"
              >
                Signup
              </Link>
              <Link
                href={"/login"}
                className="border bg-purple-900 text-white py-1 px-3 rounded-lg hover:bg-purple-800 "
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="flex justify-end p-4 border-b">
              <ProfileDropdown />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
