"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-white shadow-sm border border-neutral-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Welcome back</h1>
        <p className="text-neutral-500">Sign in to your workspace</p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-neutral-500">
        Don't have an account?{" "}
        <Link href="/signup" className="text-neutral-900 font-medium hover:underline">
          Create a workspace
        </Link>
      </div>
    </div>
  );
}
