import { LoginForm } from "./login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SiteLog",
  description: "Sign in to your SiteLog workspace"
};

export default function LoginPage() {
  return (
    <LoginForm />
  );
}
