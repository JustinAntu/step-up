"use client";

import { useActionState, useState } from "react";

import {
  updateDisplayName,
  type ProfileActionState,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";

const initial: ProfileActionState = {};

type Props = {
  defaultName: string;
};

export function DisplayNameForm({ defaultName }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateDisplayName,
    initial,
  );
  const [value, setValue] = useState(defaultName);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor="display_name">
        Display name
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id="display_name"
          name="display_name"
          type="text"
          maxLength={80}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-12 min-h-11 w-full flex-1 rounded-lg border border-input bg-background px-4 text-base outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px] sm:max-w-xs"
        />
        <Button
          type="submit"
          variant="secondary"
          className="h-12 min-h-11 shrink-0 touch-manipulation"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Update"}
        </Button>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-muted-foreground" role="status">
          Name updated.
        </p>
      ) : null}
    </form>
  );
}
