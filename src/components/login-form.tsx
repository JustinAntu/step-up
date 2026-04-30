"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    if (!configured) {
      setStatus("error");
      setMessage("Supabase is not configured. Add keys to .env.local.");
      return;
    }
    setStatus("sending");
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error: signError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (signError) {
        setStatus("error");
        setMessage(signError.message);
        return;
      }
      setStatus("sent");
      setMessage("Check your email for the sign-in link.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error === "auth" ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Sign-in failed. Request a new link below.
        </p>
      ) : null}
      {error === "config" ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Server configuration is incomplete. Set Supabase env vars and
          restart.
        </p>
      ) : null}
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
            className="h-12 min-h-11 w-full rounded-lg border border-input bg-background px-4 text-base outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]"
            placeholder="you@company.com"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 min-h-11 w-full touch-manipulation text-base"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending link…" : "Email me a magic link"}
        </Button>
      </form>
      {message ? (
        <p
          className={
            status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
