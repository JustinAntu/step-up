"use client";

import { useState, type ReactNode } from "react";

interface Props {
  value: string;
  children: ReactNode;
}

export function CopyInviteButton({ value, children }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
      aria-label={copied ? "Copied!" : `Copy invite code ${value}`}
    >
      {copied ? (
        <span className="text-xs font-medium text-primary">Copied!</span>
      ) : (
        children
      )}
    </button>
  );
}
