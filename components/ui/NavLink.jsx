"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

function NavLink({ href, children }) {
  const pathname = usePathname();

  const isActive = pathname.startsWith(href);
  return (
    <div>
      <Link
        href={href}
        className={`${
          isActive
            ? "bg-blue-400"
            : "text-gray-300 hover:bg-blue-400 hover:text-white"
        } flex items-center px-4 py-2 gap-2 rounded-lg text-md font-medium transition-all duration-200  `}
      >
        {children}
      </Link>
    </div>
  );
}

export default NavLink;
