"use client";

import { useState, useRef, useEffect } from "react";
import { IoChevronDown, IoShieldOutline, IoEyeOutline, IoCloudUploadOutline } from "react-icons/io5";

const ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage organization, projects & evaluators",
    icon: IoShieldOutline,
  },
  {
    value: "reviewer",
    label: "Reviewer",
    description: "Evaluate and score video submissions",
    icon: IoEyeOutline,
  },
  {
    value: "submitter",
    label: "Submitter",
    description: "Submit videos for AI-assisted evaluation",
    icon: IoCloudUploadOutline,
  },
];

export default function RoleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = ROLES.find((r) => r.value === value) ?? ROLES[0];
  const SelectedIcon = selected.icon;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter" || e.key === " ") { setOpen((v) => !v); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = ROLES.findIndex((r) => r.value === value);
      onChange(ROLES[(idx + 1) % ROLES.length].value);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = ROLES.findIndex((r) => r.value === value);
      onChange(ROLES[(idx - 1 + ROLES.length) % ROLES.length].value);
    }
  }

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          input-base focus-ring w-full rounded-xl px-3 py-2.5 text-sm flex items-center justify-between gap-3
          transition-all duration-200 cursor-pointer
          ${open ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/40" : ""}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5">
          <SelectedIcon className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
          <span className="text-[var(--color-text)]">{selected.label}</span>
        </span>
        <IoChevronDown
          className={`h-4 w-4 text-[var(--color-text-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      <div
        role="listbox"
        aria-label="Select role"
        className={`
          absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[var(--color-border)]
          bg-[var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden
          transition-all duration-200 origin-top
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <div className="p-1.5 space-y-0.5">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = role.value === value;
            return (
              <button
                key={role.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(role.value); setOpen(false); }}
                className={`
                  w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left
                  transition-colors duration-150
                  ${isSelected
                    ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30"
                    : "hover:bg-[var(--color-border)]/40 border border-transparent"
                  }
                `}
              >
                <span className={`mt-0.5 shrink-0 ${isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm font-medium ${isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>
                    {role.label}
                  </span>
                  <span className="block text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-snug">
                    {role.description}
                  </span>
                </span>
                {isSelected && (
                  <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
