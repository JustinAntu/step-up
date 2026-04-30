"use client";

import { useActionState, useState } from "react";

import { updateDisplayName } from "@/app/actions/profile";
import { createTeam, joinTeam, skipOnboarding } from "@/app/actions/teams";
import { Button } from "@/components/ui/button";
import { TeamAvatarPicker } from "@/components/team-avatar";

type Step = "name" | "team" | "create" | "join";

interface Props {
  initialStep: Step;
  defaultName: string;
}

// ── Step 1: Name ──────────────────────────────────────────────────────────────

function NameStep({ defaultName, onNext }: { defaultName: string; onNext: () => void }) {
  const [state, formAction, isPending] = useActionState(updateDisplayName, {});

  // Advance after a successful save
  if (state.ok) {
    onNext();
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="display_name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          defaultValue={defaultName}
          placeholder="Jane Smith"
          maxLength={80}
          autoFocus
          className="h-12 rounded-lg border border-input bg-background px-4 text-base outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]"
        />
        <p className="text-xs text-muted-foreground">
          This is how you appear on the leaderboard.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base"
        disabled={isPending}
      >
        {isPending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}

// ── Step 2: Team choice ───────────────────────────────────────────────────────

function TeamChoiceStep({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: () => void;
}) {
  const [skipState, skipAction, isSkipping] = useActionState(skipOnboarding, {});

  return (
    <div className="flex flex-col gap-4">
      {skipState.error && (
        <p className="text-sm text-destructive" role="alert">
          {skipState.error}
        </p>
      )}

      <button
        type="button"
        onClick={onCreate}
        className="group flex flex-col gap-2 rounded-xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent/20"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <span className="font-semibold">Create a team</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Start a new team and invite colleagues using a unique code.
        </p>
      </button>

      <button
        type="button"
        onClick={onJoin}
        className="group flex flex-col gap-2 rounded-xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent/20"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <span className="font-semibold">Join a team</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Already have a team code? Enter it to join your colleagues.
        </p>
      </button>

      <form action={skipAction}>
        <button
          type="submit"
          disabled={isSkipping}
          className="w-full rounded-xl border-2 border-dashed border-border bg-transparent p-5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {isSkipping ? "Redirecting…" : "Skip for now — I'll set up a team later"}
        </button>
      </form>
    </div>
  );
}

// ── Step 3a: Create team ──────────────────────────────────────────────────────

function CreateTeamStep({ onBack }: { onBack: () => void }) {
  const [state, formAction, isPending] = useActionState(createTeam, {});
  const [emoji, setEmoji] = useState("👟");
  const [color, setColor] = useState("#6366f1");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Team name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="The Power Walkers"
          maxLength={60}
          autoFocus
          className="h-12 rounded-lg border border-input bg-background px-4 text-base outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]"
        />
      </div>

      <TeamAvatarPicker
        emoji={emoji}
        color={color}
        onEmojiChange={setEmoji}
        onColorChange={setColor}
      />

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
        >
          Back
        </button>
        <Button
          type="submit"
          size="lg"
          className="h-12 flex-1 text-base"
          disabled={isPending}
        >
          {isPending ? "Creating…" : "Create team"}
        </Button>
      </div>
    </form>
  );
}

// ── Step 3b: Join team ────────────────────────────────────────────────────────

function JoinTeamStep({ onBack }: { onBack: () => void }) {
  const [state, formAction, isPending] = useActionState(joinTeam, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="invite_code" className="text-sm font-medium">
          Team invite code
        </label>
        <input
          id="invite_code"
          name="invite_code"
          type="text"
          required
          placeholder="e.g. XK7NP"
          maxLength={5}
          autoFocus
          autoCapitalize="characters"
          className="h-12 rounded-lg border border-input bg-background px-4 text-center font-mono text-xl uppercase tracking-widest outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]"
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
          }}
        />
        <p className="text-xs text-muted-foreground">
          Ask your team leader for the 5-character code.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
        >
          Back
        </button>
        <Button
          type="submit"
          size="lg"
          className="h-12 flex-1 text-base"
          disabled={isPending}
        >
          {isPending ? "Joining…" : "Join team"}
        </Button>
      </div>
    </form>
  );
}

// ── Root wizard ───────────────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  name:   "What's your name?",
  team:   "Set up your team",
  create: "Create a team",
  join:   "Join a team",
};

const STEP_DESCRIPTIONS: Record<Step, string> = {
  name:   "Let's personalise your Step Up profile.",
  team:   "Teams help you stay motivated and compete with colleagues.",
  create: "Give your team a name and a look.",
  join:   "Enter the code your team leader shared with you.",
};

export function OnboardingWizard({ initialStep, defaultName }: Props) {
  const [step, setStep] = useState<Step>(initialStep);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step === "name" ? "bg-primary" : "bg-primary"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step !== "name" ? "bg-primary" : "bg-border"
            }`}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Step Up — Getting started
          </div>
          <h1 className="text-2xl font-bold">{STEP_LABELS[step]}</h1>
          <p className="mt-1 text-muted-foreground">{STEP_DESCRIPTIONS[step]}</p>
        </div>

        {/* Step content */}
        {step === "name" && (
          <NameStep
            defaultName={defaultName}
            onNext={() => setStep("team")}
          />
        )}

        {step === "team" && (
          <TeamChoiceStep
            onCreate={() => setStep("create")}
            onJoin={() => setStep("join")}
          />
        )}

        {step === "create" && (
          <CreateTeamStep onBack={() => setStep("team")} />
        )}

        {step === "join" && (
          <JoinTeamStep onBack={() => setStep("team")} />
        )}
      </div>
    </div>
  );
}
