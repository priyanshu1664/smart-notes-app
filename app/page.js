"use client";

import { setUser } from "@/store/userSlice";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  //console.log("user", user);

  return <h3 className="capitalize">Welcome </h3>;
}
