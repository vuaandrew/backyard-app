"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    setMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created. Check your email if confirmation is required."
    );
  }

  async function signIn() {
    setMessage("Signing in...");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Signed in successfully.");

    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7ee] p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="text-5xl">
          🌱
        </div>

        <h1 className="mt-4 text-3xl font-bold text-[#203020]">
          Welcome to Backyard
        </h1>

        <p className="mt-2 text-gray-600">
          Grow your real garden and build its digital twin.
        </p>

        <div className="mt-8">
          <label className="text-sm font-semibold text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-700">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Choose a password"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          />
        </div>

        <button
          onClick={signIn}
          className="mt-6 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
        >
          Sign in
        </button>

        <button
          onClick={signUp}
          className="mt-3 w-full rounded-xl border border-green-700 px-4 py-3 font-semibold text-green-700 hover:bg-green-50"
        >
          Create account
        </button>

        {message && (
          <p className="mt-4 text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}