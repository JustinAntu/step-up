"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  ok?: boolean;
  error?: string;
};

export async function updateDisplayName(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const nameRaw = formData.get("display_name");
  if (typeof nameRaw !== "string") {
    return { error: "Invalid name." };
  }
  const displayName = nameRaw.trim().slice(0, 80);
  if (!displayName) {
    return { error: "Enter a display name (max 80 characters)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You are not signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
