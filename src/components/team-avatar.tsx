"use client";

import { useState } from "react";

const EMOJI_OPTIONS = [
  "👟", "🏃", "🚶", "🏋️", "💪", "🔥", "⚡", "🏆", "🥇", "🎯",
  "🌟", "🚀", "💯", "🦁", "🐅", "🦅", "🎖️", "🌈", "⚽", "🏀",
  "🎾", "🏊", "🚴", "🤸", "🥊", "🧗", "🏔️", "🌊", "🎿", "🏒",
];

const COLOR_OPTIONS = [
  { label: "Indigo",  value: "#6366f1" },
  { label: "Violet",  value: "#8b5cf6" },
  { label: "Pink",    value: "#ec4899" },
  { label: "Rose",    value: "#f43f5e" },
  { label: "Orange",  value: "#f97316" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
  { label: "Teal",    value: "#14b8a6" },
  { label: "Cyan",    value: "#06b6d4" },
  { label: "Sky",     value: "#0ea5e9" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Slate",   value: "#64748b" },
];

interface TeamAvatarDisplayProps {
  emoji: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export function TeamAvatarDisplay({ emoji, color, size = "md" }: TeamAvatarDisplayProps) {
  const sizeClasses = {
    sm: "size-9 text-lg",
    md: "size-14 text-3xl",
    lg: "size-20 text-4xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-2xl font-medium shadow-sm`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {emoji}
    </div>
  );
}

interface TeamAvatarPickerProps {
  emoji: string;
  color: string;
  onEmojiChange: (emoji: string) => void;
  onColorChange: (color: string) => void;
}

export function TeamAvatarPicker({
  emoji,
  color,
  onEmojiChange,
  onColorChange,
}: TeamAvatarPickerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((v) => !v)}
          className="flex size-16 items-center justify-center rounded-2xl text-3xl shadow-sm ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: color, outlineColor: color }}
          aria-label="Choose emoji"
        >
          {emoji}
        </button>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Team icon</p>
          <p className="text-xs text-muted-foreground">
            Tap to pick an emoji and choose a colour
          </p>
        </div>
      </div>

      {showEmojiPicker && (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pick an emoji
          </p>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  onEmojiChange(e);
                  setShowEmojiPicker(false);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-muted ${
                  e === emoji ? "bg-muted ring-2 ring-primary" : ""
                }`}
                aria-label={e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Team colour
        </p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onColorChange(c.value)}
              className={`size-8 rounded-full transition-transform hover:scale-110 ${
                c.value === color
                  ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                  : ""
              }`}
              style={{
                backgroundColor: c.value,
                outlineColor: c.value,
              }}
              aria-label={c.label}
            />
          ))}
        </div>
      </div>

      {/* Hidden inputs to submit values in parent form */}
      <input type="hidden" name="avatar_emoji" value={emoji} />
      <input type="hidden" name="avatar_color" value={color} />
    </div>
  );
}
