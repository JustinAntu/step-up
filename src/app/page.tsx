import Link from "next/link";

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
    <div className="landing-shell relative flex flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Walking challenge
            </p>
            <h1 className="truncate text-lg font-semibold leading-tight">Step Up</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={userEmail ? "/dashboard" : "/login"}
              className={cn(
                buttonVariants({ variant: "secondary", size: "default" }),
                "hidden min-h-11 touch-manipulation sm:inline-flex",
              )}
            >
              {userEmail ? "Dashboard" : "Sign in"}
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:gap-12 md:py-10">
        <section className="landing-hero card-kick relative overflow-hidden rounded-3xl border border-border/70 bg-card/75 p-5 text-card-foreground shadow-sm backdrop-blur-sm md:p-8">
          <div className="landing-lane" aria-hidden />
          <div className="landing-pulse landing-pulse-a" aria-hidden />
          <div className="landing-pulse landing-pulse-b" aria-hidden />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                8-week momentum sprint
              </p>
              <div className="space-y-3">
                <h2 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                  Walk with your team.
                  <span className="block text-primary">Turn every step into progress.</span>
                </h2>
                <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                  Step Up makes your corporate challenge feel alive: log daily steps, climb
                  team rankings, and keep streaks moving from any browser.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={userEmail ? "/dashboard" : "/login"}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 min-h-11 touch-manipulation text-base",
                  )}
                >
                  {userEmail ? "Continue to dashboard" : "Sign in with email"}
                </Link>
                <Link
                  href="#email-sign-in"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 min-h-11 touch-manipulation text-base",
                  )}
                >
                  Quick email sign-in
                </Link>
              </div>
              {userEmail ? (
                <p className="text-xs text-muted-foreground">Signed in as {userEmail}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No password. We send a one-time sign-in link to your inbox.
                </p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <article className="card-kick rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily target</p>
                <p className="mt-2 text-2xl font-semibold">10k+</p>
                <p className="mt-1 text-xs text-muted-foreground">Team average steps per member</p>
              </article>
              <article className="card-kick rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current streak</p>
                <p className="mt-2 text-2xl font-semibold">26 days</p>
                <p className="mt-1 text-xs text-muted-foreground">Consistent logging keeps teams hot</p>
              </article>
              <article className="card-kick rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Engagement</p>
                <p className="mt-2 text-2xl font-semibold">4x</p>
                <p className="mt-1 text-xs text-muted-foreground">More daily participation with leaderboards</p>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-kick rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.17em] text-muted-foreground">01 · Walk</p>
            <h3 className="mt-2 text-lg font-semibold">Move anywhere</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Phone in pocket, treadmill at lunch, dog walk after work. Every step counts.
            </p>
          </article>
          <article className="card-kick rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.17em] text-muted-foreground">02 · Log</p>
            <h3 className="mt-2 text-lg font-semibold">Update in seconds</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter step totals from desktop or mobile, with backfill for busy days.
            </p>
          </article>
          <article className="card-kick rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.17em] text-muted-foreground">03 · Compete</p>
            <h3 className="mt-2 text-lg font-semibold">Climb as a crew</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Watch rankings shift daily and keep momentum high with friendly competition.
            </p>
          </article>
        </section>

        <section
          id="email-sign-in"
          className="card-kick rounded-3xl border border-border/70 bg-card/75 p-5 shadow-sm backdrop-blur-sm md:p-7"
        >
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Get started</p>
              <h3 className="mt-2 text-2xl font-semibold">Join the challenge today</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use email magic link sign-in right here, or open the dedicated sign-in page.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Fast on mobile. No install required.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open full sign-in page
              </Link>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              {userEmail ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">You are already signed in as:</p>
                  <p className="text-sm font-medium">{userEmail}</p>
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-12 min-h-11 w-full touch-manipulation text-base",
                    )}
                  >
                    Open dashboard
                  </Link>
                </div>
              ) : (
                <LoginForm compact />
              )}
            </div>
          </div>
        </section>

        {!isSupabaseConfigured() ? (
          <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-50">
            <p className="font-medium">Supabase env not set</p>
            <p className="mt-1 text-muted-foreground dark:text-amber-100/90">
              Copy <code className="font-mono text-xs">.env.example</code> to{" "}
              <code className="font-mono text-xs">.env.local</code> and add your project URL and
              anon key.
            </p>
          </section>
        ) : null}
      </main>

      <footer className="relative z-10 border-t border-border/70 px-4 py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <Link href="/" className="underline-offset-4 hover:underline">
            Home
          </Link>
          <span>·</span>
          <Link href="/login" className="underline-offset-4 hover:underline">
            Sign in
          </Link>
          <span>·</span>
          <Link href="/dashboard" className="underline-offset-4 hover:underline">
            Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
