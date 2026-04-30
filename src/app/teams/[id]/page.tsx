import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CopyInviteButton } from "@/components/copy-invite-button";
import { ModeToggle } from "@/components/mode-toggle";
import { SignOutForm } from "@/components/sign-out-form";
import { TeamAvatarDisplay } from "@/components/team-avatar";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

type LeaderboardRow = {
  user_id: string;
  display_name: string | null;
  total_steps: number;
  rank: number;
};

const MEDALS = ["🥇", "🥈", "🥉"];

function formatSteps(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-AU");
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function InviteCodeBadge({ code }: { code: string }) {
  return (
    <CopyInviteButton value={code}>
      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-sm font-semibold tracking-widest">
        {code}
      </span>
      <span className="text-xs text-muted-foreground">tap to copy</span>
    </CopyInviteButton>
  );
}

export default async function TeamPage({ params }: { params: Params }) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=config");
  }

  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, avatar_emoji, avatar_color, invite_code, created_by, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!team) notFound();

  const { data: leaderboard } = await supabase.rpc("get_team_leaderboard", {
    p_team_id: id,
  });

  const rows = (leaderboard ?? []) as LeaderboardRow[];
  const totalSteps = rows.reduce((sum, r) => sum + r.total_steps, 0);
  const avgSteps = rows.length > 0 ? Math.round(totalSteps / rows.length) : 0;
  const topPerformer = rows[0]?.display_name ?? "—";

  const isMember = rows.some((r) => r.user_id === user.id);
  const isOwner = team.created_by === user.id;
  const canSeeCode = isMember || isOwner;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Dashboard
          </Link>
          <p className="truncate text-lg font-semibold leading-tight">
            {team.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SignOutForm />
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Team hero card */}
        <section className="flex items-center gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
          <TeamAvatarDisplay
            emoji={team.avatar_emoji ?? "👟"}
            color={team.avatar_color ?? "#6366f1"}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{team.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {rows.length} {rows.length === 1 ? "member" : "members"}
            </p>

            {canSeeCode && team.invite_code && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Invite code:</span>
                <InviteCodeBadge code={team.invite_code} />
              </div>
            )}
          </div>
        </section>

        {/* Stats strip */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Team stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total steps" value={formatSteps(totalSteps)} />
            <StatCard label="Avg / member" value={formatSteps(avgSteps)} />
            <StatCard label="Top performer" value={topPerformer} />
          </div>
        </section>

        {/* Member leaderboard */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Member leaderboard
          </h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No step data yet. Members can log steps on the dashboard.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {rows.map((row, i) => (
                <div
                  key={row.user_id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i !== rows.length - 1 ? "border-b border-border" : ""
                  } ${row.user_id === user.id ? "bg-primary/5" : ""}`}
                >
                  <div className="w-7 shrink-0 text-center">
                    {i < 3 ? (
                      <span className="text-xl leading-none">{MEDALS[i]}</span>
                    ) : (
                      <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {row.display_name ?? "Anonymous"}
                      {row.user_id === user.id && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatSteps(row.total_steps)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      steps
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Non-member join CTA */}
        {!isMember && !isOwner && team.invite_code && (
          <section className="rounded-xl border border-dashed border-border p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Use code{" "}
              <span className="font-mono font-semibold tracking-widest">
                {team.invite_code}
              </span>{" "}
              on the{" "}
              <Link
                href="/onboarding?step=join"
                className="underline underline-offset-4"
              >
                join page
              </Link>{" "}
              to become a member.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
