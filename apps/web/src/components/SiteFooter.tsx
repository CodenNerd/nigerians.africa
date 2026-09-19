import Link from "next/link";
import { BrandMark, FlagStripe } from "@/components/BrandMark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-paper-border">
      <FlagStripe />
      <div className="site-container py-12">
        <div className="grid gap-px bg-paper-border md:grid-cols-3">
          <div className="bg-civic-greenSoft p-6 sm:p-8">
            <BrandMark size="footer" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              A public digital civic institution. Demonstration records are illustrative — not
              official government publications.
            </p>
          </div>
          <div className="bg-civic-blueSoft p-6 sm:p-8">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-civic-blue">
              Explore
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/problems" className="text-ink no-underline hover:text-civic-green">
                  Problems
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-ink no-underline hover:text-civic-green">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/money" className="text-ink no-underline hover:text-civic-green">
                  Follow the money
                </Link>
              </li>
              <li>
                <Link href="/places" className="text-ink no-underline hover:text-civic-green">
                  Places
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-civic-amberSoft p-6 sm:p-8">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-civic-amber">
              Participate
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/report" className="text-ink no-underline hover:text-civic-green">
                  Report something
                </Link>
              </li>
              <li>
                <Link href="/guidance" className="text-ink no-underline hover:text-civic-green">
                  Civic guidance
                </Link>
              </li>
              <li>
                <Link href="/ask" className="text-ink no-underline hover:text-civic-green">
                  Ask the record
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-ink no-underline hover:text-civic-green">
                  Verifier desk
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          The platform remembers. Citizens decide.
        </p>
      </div>
    </footer>
  );
}
