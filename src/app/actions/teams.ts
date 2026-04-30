"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type TeamActionState = {
  ok?: boolean;
  error?: string;
  teamId?: string;
};

function generateInviteCode(): string {
  // Excludes visually confusing characters (0/O, 1/I/L)
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export async function createTeam(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const name = (formData.get("name") as string | null)?.trim();
  const avatarEmoji = (formData.get("avatar_emoji") as string | null) ?? "👟";
  const avatarColor = (formData.get("avatar_color") as string | null) ?? "#6366f1";

  if (!name || name.length < 2) {
    return { error: "Team name must be at least 2 characters." };
  }
  if (name.length > 60) {
    return { error: "Team name must be 60 characters or fewer." };
  }

  const supabase = await createClient();

  // Retry up to 5 times on invite code collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();

    const { data, error } = await supabase.rpc("create_team_with_owner", {
      p_name: name,
      p_avatar_emoji: avatarEmoji,
      p_avatar_color: avatarColor,
      p_invite_code: code,
    });

    if (!error && data?.[0]) {
      const teamId = data[0].team_id as string;
      revalidatePath("/dashboard");
      redirect(`/teams/${teamId}`);
    }

    // Unique constraint violation — retry with a new code
    if (error?.message?.includes("unique") || error?.message?.includes("duplicate")) {
      continue;
    }

    if (error) {
      return { error: error.message };
    }
  }

  return { error: "Could not generate a unique invite code. Please try again." };
}

export async function joinTeam(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const codeRaw = (formData.get("invite_code") as string | null)?.trim().toUpperCase();

  if (!codeRaw || codeRaw.length < 4) {
    return { error: "Enter a valid invite code (4–5 characters)." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("join_team_by_code", {
    p_invite_code: codeRaw,
  });

  if (error) {
    if (error.message?.includes("No team found")) {
      return { error: "That code doesn't match any team. Check and try again." };
    }
    return { error: error.message };
  }

  if (!data?.[0]) {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function skipOnboarding(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: TeamActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<TeamActionState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_onboarding");

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
