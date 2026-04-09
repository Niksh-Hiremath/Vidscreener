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
  const iconHeight = iconSize === "sm" ? 28 : iconSize === "lg" ? 40 : 34;
  const textSize = iconSize === "sm" ? "text-base" : iconSize === "lg" ? "text-xl" : "text-lg";

  if (compact) {
    return (
      <Link href={href} className="inline-flex items-center gap-2">
        <img
          src="/vidscreener.svg"
          alt="VidScreener"
          width={iconHeight}
          height={iconHeight}
          className="rounded-lg"
          loading="eager"
        />
        <span className={`font-bold tracking-tight text-[var(--color-text)] ${textSize}`}>
          VidScreener
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <img
        src="/vidscreener.svg"
        alt="VidScreener"
        width={iconHeight}
        height={iconHeight}
        className="rounded-lg"
        loading="eager"
      />
      <span className={`font-bold tracking-tight text-[var(--color-text)] ${textSize}`}>
        VidScreener
      </span>
    </Link>
  );
}
