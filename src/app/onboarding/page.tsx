import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding-wizard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ step?: string }>;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  // Already onboarded — bounce to dashboard
  if (profile?.onboarding_completed_at) {
    redirect("/dashboard");
  }

  const { step } = await searchParams;
  const validSteps = ["name", "team", "create", "join"] as const;
  type Step = (typeof validSteps)[number];
  const initialStep: Step = validSteps.includes(step as Step)
    ? (step as Step)
    : "name";

  const defaultName =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "";

  return (
    <OnboardingWizard initialStep={initialStep} defaultName={defaultName} />
  );
}
