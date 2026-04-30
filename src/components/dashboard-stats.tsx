interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: string;
}

function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

interface StepEntry {
  step_date: string;
  steps: number;
}

function localISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeStats(entries: StepEntry[]) {
  const today = localISODate(new Date());
  const byDate = new Map(entries.map((e) => [e.step_date, e.steps]));

  const todaySteps = byDate.get(today) ?? 0;

  // Weekly total (last 7 days including today)
  let weeklyTotal = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weeklyTotal += byDate.get(localISODate(d)) ?? 0;
  }

  // Streak: consecutive days ending today (or yesterday) with steps > 0
  let streak = 0;
  const startOffset = byDate.has(today) ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localISODate(d);
    if ((byDate.get(key) ?? 0) > 0) {
      streak++;
    } else {
      break;
    }
  }

  return { todaySteps, weeklyTotal, streak };
}

function formatSteps(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-AU");
}

interface Props {
  entries: StepEntry[];
}

export function DashboardStats({ entries }: Props) {
  const { todaySteps, weeklyTotal, streak } = computeStats(entries);

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Today"
        value={formatSteps(todaySteps)}
        sub="steps"
        icon="👟"
      />
      <StatCard
        label="This week"
        value={formatSteps(weeklyTotal)}
        sub="steps"
        icon="📅"
      />
      <StatCard
        label="Streak"
        value={`${streak}d`}
        sub={streak === 0 ? "Log today!" : streak === 1 ? "Keep it up!" : "On fire! 🔥"}
        icon="⚡"
      />
    </div>
  );
}
