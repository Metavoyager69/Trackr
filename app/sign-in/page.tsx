import { redirect } from "next/navigation";
import { SignInForm } from "@/components/sign-in-form";
import { isSignedIn } from "@/lib/server/session";

export default async function SignInPage() {
  if (await isSignedIn()) {
    redirect("/");
  }

  const adminTokenConfigured = Boolean(
    process.env.TRACKR_ADMIN_TOKEN?.trim()
  );

  return (
    <section className="create-layout">
      <div className="create-intro">
        <p className="section-label">Restricted Access</p>
        <h1 className="page-title">Sign In</h1>
        <p className="page-copy">
          Trackr gates write actions (creating projects, logging reports, and
          uploading project plans) behind a shared admin token. Sign in once to
          unlock these actions for the next eight hours.
        </p>

        <div className="glass-panel create-status">
          <div className="summary-row">
            <span className="summary-label">Admin Token</span>
            <span className="summary-value">
              {adminTokenConfigured ? "CONFIGURED" : "MISSING"}
            </span>
          </div>
          <p className="muted-copy">
            {adminTokenConfigured
              ? "An admin token is configured on the server. Enter it below to sign in."
              : "Set TRACKR_ADMIN_TOKEN in the server environment before signing in."}
          </p>
        </div>
      </div>

      <SignInForm />
    </section>
  );
}