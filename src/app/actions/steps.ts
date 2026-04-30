"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type StepActionState = {
  ok?: boolean;
  error?: string;
};

const STEP_MAX = 200_000;

function parseStepDate(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(`${trimmed}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return trimmed;
}

function parseSteps(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const n = Number.parseInt(raw.replaceAll(/[\s,]/g, ""), 10);
  if (!Number.isFinite(n) || n < 0 || n > STEP_MAX) return null;
  return n;
}

export async function saveDailySteps(
  _prev: StepActionState,
  formData: FormData,
): Promise<StepActionState> {
  const stepDate = parseStepDate(formData.get("step_date"));
  const steps = parseSteps(formData.get("steps"));

  if (!stepDate) {
    return { error: "Choose a valid date." };
  }
  if (steps === null) {
    return {
      error: `Enter steps between 0 and ${STEP_MAX.toLocaleString("en-US")}.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You are not signed in." };
  }

  const { error } = await supabase.from("daily_steps").upsert(
    {
      user_id: user.id,
      step_date: stepDate,
      steps,
    },
    { onConflict: "user_id,step_date" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
