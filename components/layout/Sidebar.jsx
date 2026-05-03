import Link from "next/link";
import React from "react";
import NavLink from "../ui/NavLink";
import { FaHome, FaStickyNote, FaChartBar } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";

function Sidebar() {
  return (
    <div className="h-screen w-64 bg-gray-500 text-white p-5 ">
      <h1 className=" text-xl font-bold mb-3 ">Smart Dashboard</h1>

      <nav className="flex flex-col gap-4">
        <NavLink href="/dashboard">
          <FaHome /> Dashboard
        </NavLink>
        <NavLink href="/notes">
          <FaStickyNote /> Notes
        </NavLink>
        <NavLink href="/tasks">
          <FaTasks /> Tasks
        </NavLink>
        <NavLink href="/analytics">
          <FaChartBar /> Analytics
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
