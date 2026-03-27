import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <BrandLogo href="/" compact iconSize="sm" />
        <nav className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
          <Link href="/pitch/aman" className="hover:text-[var(--color-text)] transition-colors">
            About
          </Link>
          <Link href="/pitch/pricing" className="hover:text-[var(--color-text)] transition-colors">
            Pricing
          </Link>
          <Link href="/pitch/evaluators" className="hover:text-[var(--color-text)] transition-colors">
            For Evaluators
          </Link>
          <Link href="/login" className="hover:text-[var(--color-text)] transition-colors">
            Sign In
          </Link>
        </nav>
        <p className="text-xs text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} VidScreener. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
