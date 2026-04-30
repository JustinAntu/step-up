import Link from "next/link";
import Image from "next/image";

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
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
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

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:gap-12 md:py-10">
        <section className="landing-hero card-kick relative overflow-hidden rounded-3xl border border-border/50 bg-card/65 p-5 text-card-foreground shadow-sm backdrop-blur-md md:p-8">
          <div className="landing-lane" aria-hidden />
          <div className="landing-pulse landing-pulse-a" aria-hidden />
          <div className="landing-pulse landing-pulse-b" aria-hidden />
          <div className="landing-orbit landing-orbit-a" aria-hidden />
          <div className="landing-orbit landing-orbit-b" aria-hidden />
          <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div className="space-y-6">
              <p className="inline-flex rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Season: city stride
              </p>
              <div className="space-y-3">
                <h2 className="text-balance text-4xl font-semibold leading-[1.02] sm:text-5xl md:text-6xl">
                  Make workdays feel
                  <span className="block landing-gradient-text">like game night.</span>
                </h2>
                <p className="max-w-xl text-sm text-foreground/85 sm:text-base">
                  Race up the team ladder, unlock streaks, and turn every commute, lunch walk,
                  and after-hours stroll into points for your crew.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={userEmail ? "/dashboard" : "/login"}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 min-h-11 touch-manipulation border border-primary/40 bg-primary text-primary-foreground text-base shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
                  )}
                >
                  {userEmail ? "Jump back in" : "Start with email"}
                </Link>
                <Link
                  href="#email-sign-in"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 min-h-11 touch-manipulation border-border/60 bg-background/40 text-base",
                  )}
                >
                  Enter sprint lane
                </Link>
              </div>
              {userEmail ? (
                <p className="text-xs text-foreground/70">Signed in as {userEmail}</p>
              ) : (
                <p className="text-xs text-foreground/70">
                  Passwordless. One link in your inbox and you are in.
                </p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <article className="card-kick rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-primary/80">Crew pace</p>
                <p className="mt-2 text-2xl font-semibold">12,400</p>
                <p className="mt-1 text-xs text-foreground/65">avg steps per teammate daily</p>
              </article>
              <article className="card-kick rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-primary/80">Longest streak</p>
                <p className="mt-2 text-2xl font-semibold">31 days</p>
                <p className="mt-1 text-xs text-foreground/65">momentum squads stay visible</p>
              </article>
              <article className="card-kick rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-primary/80">Participation lift</p>
                <p className="mt-2 text-2xl font-semibold">4.2x</p>
                <p className="mt-1 text-xs text-foreground/65">more daily check-ins with ranking</p>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <article className="card-kick rounded-3xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.17em] text-primary/85">Challenge loop</p>
            <h3 className="mt-2 text-2xl font-semibold">Walk. Log. Leap.</h3>
            <p className="mt-2 text-sm text-foreground/75">
              Designed like a lightweight game cycle: tiny daily actions, visible progress, and
              teammate momentum that keeps pulling everyone forward.
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="rounded-xl border border-border/40 bg-background/45 px-3 py-2">01 · Walk your day</div>
              <div className="rounded-xl border border-border/40 bg-background/45 px-3 py-2">02 · Log in seconds</div>
              <div className="rounded-xl border border-border/40 bg-background/45 px-3 py-2">03 · Watch rankings move</div>
            </div>
          </article>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="card-kick rounded-2xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.17em] text-primary/85">Energy</p>
              <h3 className="mt-2 text-lg font-semibold">Live leaderboard feels</h3>
              <p className="mt-2 text-sm text-foreground/75">
                Team positions shift daily so people see effort translate into results.
              </p>
            </article>
            <article className="card-kick rounded-2xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.17em] text-primary/85">Flow</p>
              <h3 className="mt-2 text-lg font-semibold">Fast from any device</h3>
              <p className="mt-2 text-sm text-foreground/75">
                Optimized for phone and desktop with no app install friction.
              </p>
            </article>
            <article className="card-kick rounded-2xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-md sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.17em] text-primary/85">Consistency</p>
              <h3 className="mt-2 text-lg font-semibold">Backfill missed days, keep streak alive</h3>
              <p className="mt-2 text-sm text-foreground/75">
                Busy day yesterday? Update quickly and keep your team momentum uninterrupted.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-marquee rounded-3xl border border-border/50 bg-card/65 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="landing-marquee-track text-sm font-medium uppercase tracking-[0.2em] text-foreground/75">
            <span>Walk to win</span>
            <span>Team momentum</span>
            <span>Daily streaks</span>
            <span>Friendly rivalry</span>
            <span>Walk to win</span>
            <span>Team momentum</span>
            <span>Daily streaks</span>
            <span>Friendly rivalry</span>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="card-kick media-frame relative overflow-hidden rounded-3xl border border-border/50 bg-card/70 p-2 shadow-sm backdrop-blur-md">
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="/walk-crew-01.svg"
                alt="Team members walking together in a challenge session"
                width={1200}
                height={800}
                className="landing-media h-full w-full object-cover"
                priority
              />
            </div>
            <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-2xl border border-white/20 bg-black/30 p-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/80">Challenge moments</p>
              <p className="mt-1 text-sm font-medium text-white">Turn daily walks into team highlights</p>
            </div>
          </article>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="card-kick media-frame relative overflow-hidden rounded-3xl border border-border/50 bg-card/70 p-2 shadow-sm backdrop-blur-md">
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/walk-crew-02.svg"
                  alt="Neon running lanes representing step progress"
                  width={1200}
                  height={800}
                  className="landing-media h-full w-full object-cover"
                />
              </div>
            </article>
            <article className="card-kick media-frame relative overflow-hidden rounded-3xl border border-border/50 bg-card/70 p-2 shadow-sm backdrop-blur-md">
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/walk-crew-03.svg"
                  alt="Stylized central runner with glowing rings"
                  width={1200}
                  height={800}
                  className="landing-media h-full w-full object-cover"
                />
              </div>
            </article>
          </div>
        </section>

        <section
          id="email-sign-in"
          className="card-kick rounded-3xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-md md:p-7"
        >
          <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/85">Get in the race</p>
              <h3 className="mt-2 text-2xl font-semibold">Launch your crew in under 30 seconds</h3>
              <p className="mt-2 text-sm text-foreground/75">
                Enter email below for magic link access, or use the dedicated sign-in page if you
                prefer the classic route.
              </p>
              <p className="mt-3 text-xs text-foreground/65">
                No passwords. No setup. Just open and move.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open full sign-in page
              </Link>
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/55 p-4 backdrop-blur-md">
              {userEmail ? (
                <div className="space-y-3">
                  <p className="text-sm text-foreground/70">You are already signed in as:</p>
                  <p className="text-sm font-medium">{userEmail}</p>
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-12 min-h-11 w-full touch-manipulation border border-primary/40 bg-primary text-primary-foreground text-base shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
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

      <footer className="relative z-10 border-t border-border/40 px-4 py-4 text-center text-xs text-foreground/65">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
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
