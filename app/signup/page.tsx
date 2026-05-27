import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Workspace | SiteLog",
  description: "Create a new workspace for your organization"
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-neutral-500">Loading form...</div>}>
      <SignupForm />
    </Suspense>
  );
}
