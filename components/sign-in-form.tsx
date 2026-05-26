"use client";

import { useActionState } from "react";
import { signInAction } from "@/app/sign-in/actions";
import { initialSignInFormState } from "@/app/sign-in/form-state";

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialSignInFormState
  );

  return (
    <form action={formAction} className="glass-panel form-shell">
      <div className="form-shell-header">
        <div>
          <p className="section-label">Access Control</p>
          <h2 className="form-heading">Sign In</h2>
        </div>
      </div>

      <p className="helper-text">
        Enter the admin token configured for this Trackr deployment to unlock
        project, report, and plan-upload actions.
      </p>

      <div className="field">
        <label htmlFor="token">Admin token</label>
        <input
          autoComplete="current-password"
          className="form-input"
          disabled={isPending}
          id="token"
          name="token"
          required
          type="password"
        />
      </div>

      {state.error ? (
        <p aria-live="polite" className="helper-text form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="form-actions">
        <button
          className="nav-button nav-button-primary form-submit"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </form>
  );
}