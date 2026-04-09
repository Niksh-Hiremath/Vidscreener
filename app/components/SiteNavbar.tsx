"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";
import type { SessionUser } from "../lib/session";

export default function SiteNavbar({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <div className="mx-6 px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo href="/" iconSize="sm" />
        </div>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="button-primary rounded-lg px-3.5 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/logout" className="button-secondary rounded-lg px-3.5 py-2 text-sm text-[var(--color-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface)]/80">
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="button-secondary rounded-lg px-3.5 py-2 text-sm border-[var(--color-border)] hover:bg-[var(--color-surface)]/80">
                Login
              </Link>
              <Link href="/register" className="button-primary rounded-lg px-3.5 py-2 text-sm font-medium">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
