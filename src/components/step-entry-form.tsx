"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { saveDailySteps, type StepActionState } from "@/app/actions/steps";
import { Button } from "@/components/ui/button";

function localISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const initialStepState: StepActionState = {};

export function StepEntryForm() {
  const [state, formAction, isPending] = useActionState(
    saveDailySteps,
    initialStepState,
  );
  const [stepDate, setStepDate] = useState(() => localISODate(new Date()));
  const [steps, setSteps] = useState("");

  const today = useMemo(() => localISODate(new Date()), []);

  useEffect(() => {
    if (!state.ok) return;
    queueMicrotask(() => setSteps(""));
  }, [state.ok]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="step_date">
          Date
        </label>
        <input
          id="step_date"
          name="step_date"
          type="date"
          required
          value={stepDate}
          onChange={(e) => setStepDate(e.target.value)}
          className="h-12 min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]"
        />
        <p className="text-xs text-muted-foreground">
          Today is {today}. Pick any day to log or fix a missed entry.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="steps">
          Steps
        </label>
        <input
          id="steps"
          name="steps"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          required
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="e.g. 8432"
          className="h-12 min-h-11 w-full rounded-lg border border-input bg-background px-4 text-base outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-muted-foreground" role="status">
          Saved.
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        className="h-12 min-h-11 w-full touch-manipulation text-base"
        disabled={isPending}
      >
        {isPending ? "Saving…" : "Save steps"}
      </Button>
    </form>
  );
}
