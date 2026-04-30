"use client";

import { useState } from "react";
import Link from "next/link";

export type LeaderboardRow = {
  user_id: string;
  display_name: string | null;
  total_steps: number;
  rank: number;
};

export type TeamInfo = {
  id: string;
  name: string;
  avatar_emoji: string;
  avatar_color: string;
};

interface Props {
  currentUserId: string;
  globalRows: LeaderboardRow[];
  teamRows: LeaderboardRow[];
  firstTeam: TeamInfo | null;
}

const MEDALS = ["🥇", "🥈", "🥉"];

function formatSteps(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-AU");
}

function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No data yet — be the first to log steps!
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {rows.map((row, i) => {
        const isMe = row.user_id === currentUserId;
        return (
          <div
            key={row.user_id}
            className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-primary/5" : ""}`}
          >
            <div className="w-7 shrink-0 text-center">
              {i < 3 ? (
                <span className="text-lg leading-none">{MEDALS[i]}</span>
              ) : (
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {row.display_name ?? "Anonymous"}
                {isMe && (
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
        );
      })}
    </div>
  );
}

export function LeaderboardWidget({
  currentUserId,
  globalRows,
  teamRows,
  firstTeam,
}: Props) {
  const [tab, setTab] = useState<"global" | "team">(
    firstTeam && teamRows.length > 0 ? "team" : "global",
  );

  const hasTeam = firstTeam !== null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("global")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
            tab === "global"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🌍 Global
        </button>
        {hasTeam && (
          <button
            type="button"
            onClick={() => setTab("team")}
            className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "team"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{firstTeam.avatar_emoji}</span>
            <span className="truncate max-w-24">{firstTeam.name}</span>
          </button>
        )}
      </div>

      {/* Content */}
      {tab === "global" && (
        <LeaderboardTable rows={globalRows} currentUserId={currentUserId} />
      )}
      {tab === "team" && hasTeam && (
        <>
          <LeaderboardTable rows={teamRows} currentUserId={currentUserId} />
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href={`/teams/${firstTeam.id}`}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              View full team page →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
