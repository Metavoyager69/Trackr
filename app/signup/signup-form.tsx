"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupAction } from "./actions";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, {});
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") ?? "";

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-white shadow-sm border border-neutral-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          {inviteToken ? "Join Workspace" : "Create Workspace"}
        </h1>
        <p className="text-neutral-500">
          {inviteToken ? "Create an account to accept your invitation" : "Start managing your projects and reports securely"}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="inviteToken" value={inviteToken} />

        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
            placeholder="Jane Doe"
          />
        </div>

        {!inviteToken && (
          <div className="space-y-2">
            <label htmlFor="organizationName" className="block text-sm font-medium text-neutral-700">
              Workspace Name
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
              placeholder="Acme Corp"
            />
          </div>
        )}

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
            minLength={8}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-colors"
            placeholder="••••••••"
          />
          <p className="text-xs text-neutral-500">Must be at least 8 characters long</p>
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
          {isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-neutral-900 font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
