"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });
      console.log(res.data);
      toast.success("Signup Successful");
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form
      onSubmit={handleSignup}
      className="max-w-md mx-auto mt-20 flex flex-col gap-2"
    >
      <input
        type="text"
        className="border p-2 w-full mb-3"
        placeholder="Username"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        className="border p-2 w-full mb-3"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-3"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Link href={"/login"} className="">
        Existing user? Login here
      </Link>
      <button className="bg-green-600 text-white px-4 py-2 w-full">
        Signup
      </button>
    </form>
  );
}
