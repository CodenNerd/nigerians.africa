/**
 * Header logo — Nigeria4Nigerians in civic green (font color only).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={`font-display text-xl tracking-tight text-civic-green sm:text-2xl ${className ?? ""}`}
    >
      Nigeria4Nigerians
    </span>
  );
}
