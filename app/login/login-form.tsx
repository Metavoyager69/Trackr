"use client";

import { useActionState } from "react";
import Link from "next/link";
import Script from "next/script";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <>
      <Script src="https://cdn.tailwindcss.com?plugins=forms,container-queries" strategy="beforeInteractive" />
      
      <style>{`
        .top-nav, .site-footer {
          display: none !important;
        }
        .page-shell {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        body {
          background-color: #000000 !important;
          background-image: 
            linear-gradient(to right, #111111 1px, transparent 1px),
            linear-gradient(to bottom, #111111 1px, transparent 1px) !important;
          background-size: 20px 20px !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #ffffff;
          min-height: 100vh;
          margin: 0;
        }
        .custom-input {
          background-color: #222222 !important;
          border: 1px solid #444444 !important;
          color: #ffffff !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .custom-input:focus {
          outline: none !important;
          border-color: #ffffff !important;
          box-shadow: 0 0 0 1px #ffffff !important;
        }
        .custom-input::placeholder {
          color: #888888 !important;
        }
      `}</style>

      <main className="w-full max-w-md flex flex-col items-center space-y-8 p-6" data-purpose="login-form-container">
        {/* BEGIN: MainHeader */}
        <header className="text-center mt-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">SiteLog</h1>
        </header>
        {/* END: MainHeader */}

        {/* BEGIN: TitleSection */}
        <div className="text-center space-y-2" data-purpose="hero-section">
          <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-300 text-base">
            Sign in to your workspace
          </p>
        </div>
        {/* END: TitleSection */}

        {/* BEGIN: LoginForm */}
        <form action={formAction} className="w-full space-y-6" data-purpose="workspace-login-form">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white" htmlFor="email">Email</label>
            <input 
              className="custom-input w-full px-4 py-3 rounded-lg text-lg" 
              id="email" 
              name="email" 
              placeholder="name@example.com" 
              required 
              type="email"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white" htmlFor="password">Password</label>
            <input 
              className="custom-input w-full px-4 py-3 rounded-lg text-lg" 
              id="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              type="password"
            />
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {state.error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button 
              className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-semibold py-4 px-4 rounded-xl text-lg transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed" 
              data-purpose="submit-button" 
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
        {/* END: LoginForm */}

        {/* BEGIN: Footer */}
        <footer className="text-center pb-8">
          <p className="text-gray-300">
            Don't have an account?{" "}
            <Link className="text-[#007AFF] hover:underline font-medium" href="/signup">
              Create a workspace
            </Link>
          </p>
        </footer>
        {/* END: Footer */}
      </main>
    </>
  );
}
