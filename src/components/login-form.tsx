"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Mode = "sign-in" | "sign-up" | "reset";
type Status = "idle" | "loading" | "success" | "error";

export function LoginForm({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlNotice = searchParams.get("notice");

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  function clearStatus() {
    setStatus("idle");
    setMessage(null);
    setPassword("");
    setShowPassword(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    clearStatus();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!configured) {
      setStatus("error");
      setMessage("Supabase is not configured. Add keys to .env.local.");
      return;
    }

    setStatus("loading");

    try {
      const supabase = createBrowserSupabaseClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setStatus("error");
          setMessage(
            error.message === "Invalid login credentials"
              ? "Wrong email or password. Try again or create an account."
              : error.message,
          );
          return;
        }
        window.location.href = "/dashboard";
        return;
      }

      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        setStatus("success");
        setMessage(
          "Account created! Check your inbox to confirm your email, then sign in.",
        );
        return;
      }

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/auth/callback` },
        );
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        setStatus("success");
        setMessage("Password reset email sent — check your inbox.");
        return;
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputSm =
    "h-11 min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]";
  const inputMd =
    "h-12 min-h-11 w-full rounded-lg border border-input bg-background px-4 text-base outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]";
  const inputBase = compact ? inputSm : inputMd;

  const submitLabel: Record<Mode, string> = {
    "sign-in": status === "loading" ? "Signing in…" : "Sign in",
    "sign-up": status === "loading" ? "Creating account…" : "Create account",
    reset: status === "loading" ? "Sending…" : "Send reset email",
  };

  return (
    <div className={compact ? "flex flex-col gap-3" : "flex flex-col gap-4"}>
      {urlNotice === "reset" ? (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          Password reset confirmed. Sign in with your new password below.
        </p>
      ) : null}
      {urlError === "auth" ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Sign-in failed. Check your credentials or reset your password below.
        </p>
      ) : null}
      {urlError === "config" ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Server configuration is incomplete. Set Supabase env vars and restart.
        </p>
      ) : null}

      {!compact && (
        <p className="text-sm text-muted-foreground">
          {mode === "sign-in" && "Sign in to your account."}
          {mode === "sign-up" && "Create a new account with your work email."}
          {mode === "reset" && "We will send a reset link to your inbox."}
        </p>
      )}

      <form
        className={compact ? "flex flex-col gap-2.5" : "flex flex-col gap-3"}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            placeholder="you@company.com"
          />
        </div>

        {mode !== "reset" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                required
                minLength={mode === "sign-up" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={
                  compact
                    ? `${inputSm} pr-12`
                    : `${inputMd} pr-14`
                }
                placeholder={
                  mode === "sign-up" ? "Min. 8 characters" : "••••••••"
                }
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className={
            compact
              ? "h-11 min-h-11 w-full touch-manipulation text-sm"
              : "h-12 min-h-11 w-full touch-manipulation text-base"
          }
          disabled={status === "loading"}
        >
          {submitLabel[mode]}
        </Button>
      </form>

      {message ? (
        <p
          className={
            status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      {!compact && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-sm">
          {mode !== "sign-in" && (
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => switchMode("sign-in")}
            >
              Sign in instead
            </button>
          )}
          {mode !== "sign-up" && (
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => switchMode("sign-up")}
            >
              {mode === "reset" ? "Create account" : "Create account"}
            </button>
          )}
          {mode !== "reset" && (
            <button
              type="button"
              className="ml-auto text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => switchMode("reset")}
            >
              Forgot password?
            </button>
          )}
        </div>
      )}
    </div>
  );
}
