"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";
import { FaUser, FaCog, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
//import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";

export default function ProfileDropdown() {
  const { user } = useSelector((s) => s.user);
  const router = useRouter();
  async function handleLogout(e) {
    await signOut({ redirect: true, callbackUrl: "/login" });
  }

  return (
    <DropdownMenu>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photo || ""} />
            <AvatarFallback className={"bold"}>
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium capitalize">{user.name || "User"}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuContent className="w-56 mr-4 mt-2">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-md text-gray-500">{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={"/dashboard"}>
            <FaTachometerAlt className="mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={"/profile"}>
            <FaUser className="mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={"/settings"}>
            <FaCog className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-red-500">
          <button onClick={handleLogout}>
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
