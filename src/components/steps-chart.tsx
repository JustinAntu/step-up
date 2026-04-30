"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface StepDay {
  step_date: string;
  steps: number;
}

interface Props {
  data: StepDay[];
}

const chartConfig = {
  steps: {
    label: "Steps",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

function formatDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  const [, month, day] = dateStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}`;
}

function formatStepsShort(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export function StepsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No step data yet — log your first day to see the chart.
      </div>
    );
  }

  // Show up to 30 days, oldest first for the chart
  const chartData = [...data]
    .sort((a, b) => a.step_date.localeCompare(b.step_date))
    .slice(-30)
    .map((d) => ({
      date: formatDate(d.step_date),
      steps: d.steps,
      fullDate: d.step_date,
    }));

  return (
    <ChartContainer config={chartConfig} className="h-44 w-full">
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          interval={Math.floor(chartData.length / 6)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          tickFormatter={formatStepsShort}
          width={32}
        />
        <ChartTooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          content={
            <ChartTooltipContent
              formatter={(value) => [
                `${Number(value).toLocaleString("en-AU")} steps`,
                "",
              ]}
            />
          }
        />
        <Bar
          dataKey="steps"
          fill="var(--color-primary)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ChartContainer>
  );
}
