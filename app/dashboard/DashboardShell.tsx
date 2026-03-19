"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { DashboardUser } from "./data";

type NavItem = {
  label: string;
  href: string;
};

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Videos", href: "/dashboard/videos" },
  { label: "Evaluators", href: "/dashboard/evaluators" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Manage Organization", href: "/dashboard/organization" },
];

const DEFAULT_NAV_ITEMS: NavItem[] = [{ label: "Dashboard", href: "/dashboard" }];
const EVALUATOR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Review Queue", href: "/dashboard/review-queue" },
];

const NAV_ICONS: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Projects: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  ),
  Videos: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="m17 10 4-3v10l-4-3z" />
    </svg>
  ),
  Evaluators: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  ),
  Analytics: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M8 15v-4" />
      <path d="M12 15V9" />
      <path d="M16 15V6" />
    </svg>
  ),
  "Manage Organization": (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
  "Review Queue": (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  ),
  Profile: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};

export default function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isReviewDetailRoute =
    pathname.startsWith("/dashboard/review-queue/") && pathname !== "/dashboard/review-queue";

  const navItems = useMemo(
    () =>
      user.role === "admin"
        ? ADMIN_NAV_ITEMS
        : user.role === "reviewer" || user.role === "evaluator"
          ? EVALUATOR_NAV_ITEMS
          : DEFAULT_NAV_ITEMS,
    [user.role]
  );

  const userTitle = user.name || user.email;
  const accentActive = "bg-indigo-50 border border-indigo-200 text-indigo-700";
  const accentHover = "hover:bg-indigo-50 hover:text-indigo-700";

  return (
    <div className="h-[calc(100dvh-67px)] overflow-hidden bg-transparent text-slate-900 flex">
      <aside
        className={`h-full border-r border-[var(--border-soft)] bg-white transition-all duration-200 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-[var(--border-soft)]">
            <div className={`flex items-center ${collapsed ? "justify-center" :  "gap-2 justify-between"}`}>
              {!collapsed && (
                <div>
                  <div className="text-sm font-semibold tracking-wide text-slate-900">VidScreener</div>
                  <div className="text-xs text-muted">AI-assisted evaluation</div>
                </div>
              )}

              <button
                className={`button-secondary h-9 w-9 rounded-lg flex items-center justify-center transition hover:bg-slate-100 ${collapsed && "flex-grow p-2"}`}
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m18 6-12 12" />
                    <path d="m6 6 12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scroll-subtle">
            {navItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? accentActive : `border border-transparent text-slate-600 ${accentHover}`
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
                    <span className="shrink-0">{NAV_ICONS[item.label]}</span>
                    {!collapsed ? <span>{item.label}</span> : null}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[var(--border-soft)] space-y-1.5">
            <Link
              href="/dashboard/profile"
              className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                pathname === "/dashboard/profile" ? accentActive : `text-slate-600 ${accentHover}`
              }`}
              title={collapsed ? "Profile" : undefined}
            >
              <span className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
                <span className="shrink-0">{NAV_ICONS.Profile}</span>
                {!collapsed ? <span>Profile</span> : null}
              </span>
            </Link>
            <a href="/logout" className="block rounded-xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition" title={collapsed ? "Logout" : undefined}>
              <span className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
                <span className="shrink-0">{NAV_ICONS.Logout}</span>
                {!collapsed ? <span>Logout</span> : null}
              </span>
            </a>
            {!collapsed ? (
              <div className="mt-2 surface-muted rounded-xl px-3 py-2">
                <div className="text-sm font-medium truncate">{userTitle}</div>
                <div className="text-xs text-muted capitalize">{user.role}</div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <main
        className={`flex-1 min-w-0 h-full bg-[#f3f4f8] ${
          isReviewDetailRoute ? "overflow-hidden p-0" : "overflow-y-auto p-4 md:p-6 lg:p-7 scroll-subtle"
        }`}
      >
        <div className={`${isReviewDetailRoute ? "h-full w-full" : "mx-auto w-full max-w-[1320px]"}`}>{children}</div>
      </main>
    </div>
  );
}
