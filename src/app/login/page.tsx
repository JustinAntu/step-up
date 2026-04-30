import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <Link
            href="/"
            className="truncate text-lg font-semibold leading-tight underline-offset-4 hover:underline"
          >
            Step Up
          </Link>
          <p className="truncate text-xs text-muted-foreground">Account</p>
        </div>
        <ModeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h1 className="text-base font-semibold">Sign in to Step Up</h1>

          {!configured ? (
            <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
              Add <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_*</code>{" "}
              to <code className="font-mono text-xs">.env.local</code> and restart
              the dev server.
            </p>
          ) : null}

          <div className="mt-4">
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
              <LoginForm />
            </Suspense>
          </div>
        </section>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
