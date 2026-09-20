import Link from "next/link";

export function SchemeSafetyStrip({
  reportHref,
}: {
  reportHref: string;
}) {
  return (
    <div className="border border-paper-border bg-civic-amberSoft px-5 py-5 sm:px-6 sm:py-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-civic-amber">
        Principle
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink sm:text-base">
        Surfaces evidence and case progress — <strong>not</strong> a guilt verdict. Do not dox or
        take the law into your own hands. Prefer community privacy; report urgent danger to police
        or NHRC.
      </p>
      <p className="mt-3 text-sm">
        <Link href={reportHref} className="text-civic-green no-underline hover:underline">
          Publish via report form →
        </Link>
      </p>
    </div>
  );
}
