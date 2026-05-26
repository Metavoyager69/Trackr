import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Workspace | SiteLog",
  description: "Create a new workspace for your organization"
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-8 text-neutral-500">Loading form...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
