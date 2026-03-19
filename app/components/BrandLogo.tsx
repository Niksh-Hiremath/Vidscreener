import Link from "next/link";

export default function BrandLogo({
  href = "/",
  compact = false,
  iconSize = "md",
}: {
  href?: string;
  compact?: boolean;
  iconSize?: "sm" | "md" | "lg";
}) {
  const sizeClass = iconSize === "sm" ? "h-8 w-8" : iconSize === "lg" ? "h-11 w-11" : "h-9 w-9";
  const glyphClass = iconSize === "sm" ? "h-4 w-4" : iconSize === "lg" ? "h-5 w-5" : "h-[18px] w-[18px]";

  const content = (
    <>
      <span
        className={`inline-flex ${sizeClass} items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm ring-1 ring-indigo-200/70`}
      >
        <svg
          className={`${glyphClass} text-white translate-x-[0.5px]`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <polygon points="7 5 19 12 7 19 7 5" />
        </svg>
      </span>
      {!compact ? <span className="text-xl font-bold text-slate-900">VidScreener</span> : null}
    </>
  );

  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      {content}
    </Link>
  );
}
