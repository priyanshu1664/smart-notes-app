"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log(res);
      if (res?.ok) {
        toast.success("Login Successful");
        router.push("/dashboard");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20">
      <input
        type="email"
        className="border p-2 w-full mb-3"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-3"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Link href={"/signup"}>New user ? Create an account.</Link>

      <button
        onClick={() => {
          setEmail("rahul@gmail.com");
          setPassword("12345");
        }}
        className="bg-blue-200 rounded-xl max-w-sm ml-8  border border-black  text-blue-600 px mt-4 py-2 w-full"
      >
        Auto Login
      </button>

      <button className="bg-blue-600 text-white px-4 mt-4 py-2 w-full">
        Login
      </button>
    </form>
  );
}
