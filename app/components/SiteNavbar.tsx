import Link from "next/link";
import BrandLogo from "./BrandLogo";
import type { SessionUser } from "../lib/session";

export default function SiteNavbar({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3.5 flex items-center justify-between gap-4">
        <BrandLogo href="/" iconSize="sm" />

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="button-primary rounded-lg px-3.5 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <a href="/logout" className="button-secondary rounded-lg px-3.5 py-2 text-sm text-rose-600 border-rose-200 hover:bg-rose-50">
                Logout
              </a>
            </>
          ) : (
            <>
              <Link href="/login" className="button-secondary rounded-lg px-3.5 py-2 text-sm">
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
