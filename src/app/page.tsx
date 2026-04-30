import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  let userEmail: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step challenge
          </p>
          <h1 className="truncate text-lg font-semibold leading-tight">
            Step Up
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {userEmail ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "secondary", size: "default" }),
                "hidden min-h-11 touch-manipulation sm:inline-flex",
              )}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "default" }),
                "hidden min-h-11 touch-manipulation sm:inline-flex",
              )}
            >
              Sign in
            </Link>
          )}
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="text-base font-semibold">Corporate step challenge</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log steps from your phone or desktop, see team totals, and backfill
            missed days — no app install required.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {userEmail ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 min-h-11 w-full touch-manipulation text-base sm:w-auto",
                )}
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 min-h-11 w-full touch-manipulation text-base sm:w-auto",
                )}
              >
                Sign in with email
              </Link>
            )}
          </div>
          {userEmail ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Signed in as {userEmail}
            </p>
          ) : null}
        </section>

        {!isSupabaseConfigured() ? (
          <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-50">
            <p className="font-medium">Supabase env not set</p>
            <p className="mt-1 text-muted-foreground dark:text-amber-100/90">
              Copy <code className="font-mono text-xs">.env.example</code> to{" "}
              <code className="font-mono text-xs">.env.local</code> and add your
              project URL and anon key.
            </p>
          </section>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          Built for desktop and phone browsers.
        </p>
      </main>

      <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Home
        </Link>
        {" · "}
        <Link href="/login" className="underline-offset-4 hover:underline">
          Sign in
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline-offset-4 hover:underline">
          Dashboard
        </Link>
      </footer>
    </div>
  );
}
