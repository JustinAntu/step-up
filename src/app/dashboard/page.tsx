import Link from "next/link";
import { redirect } from "next/navigation";

import { DisplayNameForm } from "@/components/display-name-form";
import { ModeToggle } from "@/components/mode-toggle";
import { SignOutForm } from "@/components/sign-out-form";
import { StepEntryForm } from "@/components/step-entry-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-lg font-semibold">Configuration needed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and a public key (
          <code className="font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </code>{" "}
          or{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          ) in <code className="font-mono text-xs">.env.local</code>, then restart{" "}
          <code className="font-mono text-xs">npm run dev</code>.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm underline-offset-4 hover:underline"
        >
          Home
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, timezone, team_id, teams(name)")
    .eq("id", user.id)
    .maybeSingle();

  const { data: recentSteps, error: stepsError } = await supabase
    .from("daily_steps")
    .select("step_date, steps, updated_at")
    .eq("user_id", user.id)
    .order("step_date", { ascending: false })
    .limit(45);

  const teamName =
    profile &&
    profile.teams &&
    typeof profile.teams === "object" &&
    "name" in profile.teams
      ? (profile.teams as { name: string }).name
      : null;

  const displayName =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "Participant";

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="truncate text-lg font-semibold leading-tight underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {teamName ? `Team: ${teamName}` : "Team not assigned yet"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SignOutForm />
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {profileError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Could not load profile: {profileError.message}
          </p>
        ) : null}
        {stepsError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Could not load steps: {stepsError.message}
          </p>
        ) : null}

        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="text-base font-semibold">Your profile</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Timezone: {profile?.timezone ?? "UTC"} (change in Supabase later if
            needed)
          </p>
          <div className="mt-4">
            <DisplayNameForm
              key={displayName}
              defaultName={displayName}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="text-base font-semibold">Log or edit steps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter totals for any day — including backfill for missed days.
          </p>
          <div className="mt-4">
            <StepEntryForm />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/30 p-4">
          <h2 className="text-sm font-semibold">Recent entries</h2>
          {!recentSteps?.length ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No steps logged yet. Add your first day above.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-background">
              {recentSteps.map((row) => (
                <li
                  key={row.step_date}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium tabular-nums">
                    {row.step_date}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.steps.toLocaleString("en-US")} steps
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
