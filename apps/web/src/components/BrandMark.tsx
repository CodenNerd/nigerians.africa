import clsx from "clsx";

const sizes = {
  sm: "text-lg sm:text-xl",
  md: "text-xl sm:text-2xl",
  lg: "text-5xl sm:text-6xl lg:text-7xl",
  footer: "text-xl",
} as const;

/**
 * Brand wordmark in Nigerian flag colours: green · white · green.
 * Display form: Nigeria4Nigerians
 */
export function BrandMark({
  size = "md",
  className,
  decorative = false,
}: {
  size?: keyof typeof sizes;
  className?: string;
  /** When true, hide from AT (parent already names the brand). */
  decorative?: boolean;
}) {
  const mid =
    size === "lg"
      ? "mx-[0.08em] min-w-[0.55em] px-[0.18em] shadow-[inset_4px_0_0_0_currentColor,inset_-4px_0_0_0_currentColor]"
      : "mx-[0.1em] min-w-[0.65em] px-[0.14em] shadow-[inset_3px_0_0_0_currentColor,inset_-3px_0_0_0_currentColor]";

  return (
    <span
      className={clsx(
        "inline-flex items-baseline font-display tracking-tight",
        sizes[size],
        className,
      )}
      aria-label={decorative ? undefined : "Nigeria4Nigerians"}
      aria-hidden={decorative || undefined}
    >
      <span className="text-civic-green">Nigeria</span>
      <span
        className={clsx(
          "relative inline-flex items-center justify-center self-center bg-white font-display leading-none text-ink text-civic-green",
          mid,
        )}
      >
        <span className="relative z-[1] text-ink">4</span>
      </span>
      <span className="text-civic-green">Nigerians</span>
    </span>
  );
}

/** Thin green–white–green stripe (flag motif). */
export function FlagStripe({ className }: { className?: string }) {
  return (
    <div
      className={clsx("grid h-1 w-full grid-cols-3", className)}
      aria-hidden
    >
      <span className="bg-civic-green" />
      <span className="bg-white" />
      <span className="bg-civic-green" />
    </div>
  );
}
