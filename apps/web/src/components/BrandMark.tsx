/**
 * Header logo — Nigeria4Nigerians with green / white / green font colors only.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={`font-display text-xl tracking-tight sm:text-2xl ${className ?? ""}`}>
      <span className="text-civic-green">Nigeria</span>
      <span className="text-white">4</span>
      <span className="text-civic-green">Nigerians</span>
    </span>
  );
}
