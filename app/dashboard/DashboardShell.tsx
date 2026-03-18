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

export default function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = useMemo(
    () =>
      user.role === "admin"
        ? ADMIN_NAV_ITEMS
        : user.role === "reviewer" || user.role === "evaluator"
          ? EVALUATOR_NAV_ITEMS
          : DEFAULT_NAV_ITEMS,
    [user.role]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside
        className={`border-r border-zinc-800 bg-zinc-900 transition-all duration-200 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <button
              className="w-full border border-zinc-700 bg-zinc-800 rounded px-3 py-2 text-sm text-left hover:bg-zinc-700"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? "▶" : "◀"}
            </button>
            {!collapsed ? (
              <div className="mt-3">
                <div className="font-semibold">{user.name || user.email}</div>
                <div className="text-xs text-zinc-400">{user.role}</div>
              </div>
            ) : null}
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded px-3 py-2 text-sm ${
                    active ? "bg-blue-600 text-white" : "hover:bg-zinc-800"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {collapsed ? item.label.slice(0, 2).toUpperCase() : item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-zinc-800 space-y-1">
            <Link
              href="/dashboard/profile"
              className={`block rounded px-3 py-2 text-sm ${
                pathname === "/dashboard/profile" ? "bg-blue-600 text-white" : "hover:bg-zinc-800"
              }`}
              title={collapsed ? "Profile" : undefined}
            >
              {collapsed ? "PR" : "Profile"}
            </Link>
            <a
              href="/logout"
              className="block rounded px-3 py-2 text-sm hover:bg-zinc-800 text-red-400"
              title={collapsed ? "Logout" : undefined}
            >
              {collapsed ? "LO" : "Logout"}
            </a>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 bg-zinc-950">{children}</main>
    </div>
  );
}
