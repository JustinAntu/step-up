import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardStats } from "@/components/dashboard-stats";
import { LeaderboardWidget, type LeaderboardRow, type TeamInfo } from "@/components/leaderboard";
import { ModeToggle } from "@/components/mode-toggle";
import { SignOutForm } from "@/components/sign-out-form";
import { StepEntryForm } from "@/components/step-entry-form";
import { StepsChart } from "@/components/steps-chart";
import { TeamAvatarDisplay } from "@/components/team-avatar";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-lg font-semibold">Configuration needed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and a public key in{" "}
          <code className="font-mono text-xs">.env.local</code>, then restart{" "}
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

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  // Redirect new users to onboarding
  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding?step=name");
  }

  const displayName =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "Participant";

  // Fetch the user's teams
  const { data: memberRows } = await supabase
    .from("team_members")
    .select("role, teams(id, name, avatar_emoji, avatar_color, invite_code)")
    .eq("user_id", user.id);

  type TeamRow = {
    role: string;
    teams: {
      id: string;
      name: string;
      avatar_emoji: string;
      avatar_color: string;
      invite_code: string;
    } | null;
  };

  const userTeams: TeamInfo[] = ((memberRows as unknown as TeamRow[]) ?? [])
    .map((r) => r.teams)
    .filter((t): t is NonNullable<typeof t> => t !== null)
    .map((t) => ({
      id: t.id,
      name: t.name,
      avatar_emoji: t.avatar_emoji,
      avatar_color: t.avatar_color,
    }));

  const firstTeam = userTeams[0] ?? null;

  // Fetch daily steps (last 45 days for chart + stats)
  const { data: stepRows } = await supabase
    .from("daily_steps")
    .select("step_date, steps")
    .eq("user_id", user.id)
    .order("step_date", { ascending: false })
    .limit(45);

  const steps = (stepRows ?? []) as { step_date: string; steps: number }[];

  // Leaderboard data
  const { data: globalLb } = await supabase.rpc("get_global_leaderboard", {
    max_rows: 10,
  });

  const globalRows = (globalLb ?? []) as LeaderboardRow[];

  let teamRows: LeaderboardRow[] = [];
  if (firstTeam) {
    const { data: teamLb } = await supabase.rpc("get_team_leaderboard", {
      p_team_id: firstTeam.id,
    });
    teamRows = (teamLb ?? []) as LeaderboardRow[];
  }

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="truncate text-lg font-semibold leading-tight underline-offset-4 hover:underline"
          >
            Step Up
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            Hey, {displayName} 👋
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SignOutForm />
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Stats strip */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your stats
          </h2>
          <DashboardStats entries={steps} />
        </section>

        {/* 30-day steps chart */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">
            Steps — last 30 days
          </h2>
          <StepsChart data={steps} />
        </section>

        {/* Log / edit steps */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-1 text-base font-semibold">Log steps</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter totals for any day, including backfill for missed days.
          </p>
          <StepEntryForm />
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Leaderboard
          </h2>
          <LeaderboardWidget
            currentUserId={user.id}
            globalRows={globalRows}
            teamRows={teamRows}
            firstTeam={firstTeam}
          />
        </section>

        {/* My teams */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              My teams
            </h2>
            <Link
              href="/onboarding?step=team"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              + Join or create
            </Link>
          </div>

          {userTeams.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
              <span className="text-3xl">🤝</span>
              <p className="text-sm text-muted-foreground">
                You&apos;re not in any team yet.
              </p>
              <Link
                href="/onboarding?step=team"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Create or join a team
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {userTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/20"
                >
                  <TeamAvatarDisplay
                    emoji={team.avatar_emoji}
                    color={team.avatar_color}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">View team →</p>
                  </div>
                </Link>
              ))}
            </div>
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
