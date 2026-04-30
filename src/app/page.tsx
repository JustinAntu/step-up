import Link from "next/link";
import { Suspense } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { LoginForm } from "@/components/login-form";
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
    <div className="landing-shell landing-grid relative flex flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/75 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">
              Team walking challenge
            </p>
            <h1 className="truncate text-lg font-semibold leading-tight">Step Up</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={userEmail ? "/dashboard" : "/login"}
              className={cn(
                buttonVariants({ variant: "secondary", size: "default" }),
                "hidden min-h-11 border border-border/50 bg-card/80 touch-manipulation sm:inline-flex",
              )}
            >
              {userEmail ? "Dashboard" : "Sign in"}
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:gap-8 md:py-10">

        {/* Hero */}
        <section className="landing-hero card-kick relative overflow-hidden rounded-3xl border border-border/50 bg-card/65 p-5 text-card-foreground shadow-sm backdrop-blur-md md:p-8">
          <div className="landing-lane" aria-hidden />
          <div className="landing-pulse landing-pulse-a" aria-hidden />
          <div className="landing-pulse landing-pulse-b" aria-hidden />
          <div className="landing-orbit landing-orbit-a" aria-hidden />
          <div className="landing-orbit landing-orbit-b" aria-hidden />

          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Season: city stride
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.02] sm:text-5xl">
                Make workdays feel
                <span className="block landing-gradient-text">like game night.</span>
              </h2>
              <p className="max-w-lg text-sm text-foreground/80 sm:text-base">
                Log daily steps, climb the team leaderboard, and keep your crew&apos;s momentum alive — from any browser, no app install needed.
              </p>
              {userEmail ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "inline-flex h-12 min-h-11 touch-manipulation border border-primary/40 bg-primary text-primary-foreground text-base shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
                    )}
                  >
                    Jump back in
                  </Link>
                  <p className="text-xs text-foreground/60">Signed in as {userEmail}</p>
                </div>
              ) : (
                <p className="text-xs text-foreground/60">
                  Email and password — works on phone and desktop.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:w-44">
              <article className="rounded-2xl border border-border/50 bg-background/50 p-3 shadow-sm backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-primary/80">Crew pace</p>
                <p className="mt-1.5 text-xl font-semibold">12,400</p>
                <p className="mt-0.5 text-xs text-foreground/60">avg steps daily</p>
              </article>
              <article className="rounded-2xl border border-border/50 bg-background/50 p-3 shadow-sm backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-primary/80">Best streak</p>
                <p className="mt-1.5 text-xl font-semibold">31 days</p>
                <p className="mt-0.5 text-xs text-foreground/60">top team record</p>
              </article>
              <article className="rounded-2xl border border-border/50 bg-background/50 p-3 shadow-sm backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-primary/80">Lift</p>
                <p className="mt-1.5 text-xl font-semibold">4.2×</p>
                <p className="mt-0.5 text-xs text-foreground/60">more check-ins</p>
              </article>
            </div>
          </div>
        </section>

        {/* Sign-in */}
        {!userEmail && (
          <section className="card-kick rounded-3xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-md md:p-7">
            <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary/85">Get started</p>
                <h3 className="mt-2 text-2xl font-semibold">Join your team</h3>
                <p className="mt-2 text-sm text-foreground/75">
                  Sign in with your work email and password. First time here? Create an account — it takes 30 seconds.
                </p>
                <p className="mt-3 text-xs text-foreground/55">
                  Forgot your password? Use the &quot;Forgot password?&quot; link in the form.
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/55 p-4 backdrop-blur-md">
                <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
                  <LoginForm compact />
                </Suspense>
                <p className="mt-3 text-xs text-foreground/55">
                  Need the full sign-in page?{" "}
                  <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Open it here
                  </Link>
                </p>
              </div>
            </div>
          </section>
        )}

        {!isSupabaseConfigured() ? (
          <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-50">
            <p className="font-medium">Supabase env not set</p>
            <p className="mt-1 text-muted-foreground dark:text-amber-100/90">
              Copy <code className="font-mono text-xs">.env.example</code> to{" "}
              <code className="font-mono text-xs">.env.local</code> and add your project URL and anon key.
            </p>
          </section>
        ) : null}
      </main>

      <footer className="relative z-10 border-t border-border/40 px-4 py-4 text-center text-xs text-foreground/55">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <Link href="/" className="underline-offset-4 hover:underline">Home</Link>
          <span>·</span>
          <Link href="/login" className="underline-offset-4 hover:underline">Sign in</Link>
          <span>·</span>
          <Link href="/dashboard" className="underline-offset-4 hover:underline">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
