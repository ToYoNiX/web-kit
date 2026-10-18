"use client";

import { cx } from "./cx";
import { useTheme } from "./use-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className={cx("tx-icon-btn", className)}
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <span aria-hidden="true">◐</span>
    </button>
  );
}
