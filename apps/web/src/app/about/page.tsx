import Link from "next/link";
import { PageIntro } from "@/components/ui";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="NigeriaForNigerians"
        title="About"
        subtitle="A public digital civic institution for Nigeria — making government, people, problems, money, projects, evidence and history visible and connected."
      />
      <div className="mt-10 max-w-2xl space-y-5">
        <p className="prose-record">
          It should feel like entering a public space where the country can be explored, understood,
          investigated and remembered — not a SaaS dashboard, social network, or conventional news
          site.
        </p>
        <blockquote className="border-l-4 border-civic-green bg-civic-greenSoft py-4 pl-5 font-display text-2xl text-ink">
          The platform remembers. Citizens decide.
        </blockquote>
        <p className="prose-record">
          This prototype implements the full product surface described in the product docs — powered
          by a connected seed graph so every documented journey is navigable. Demonstration records
          are illustrative.
        </p>
        <div className="grid gap-px bg-paper-border">
          <div className="bg-civic-greenSoft px-5 py-5">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-civic-green">
              Pool Accountability
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              See something — capture photo or video — attach it to an office, problem or polling
              unit. Evidence can feed FOI, vetted NGOs and Action follow-ups.
            </p>
          </div>
          <div className="bg-civic-blueSoft px-5 py-5">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-civic-blue">
              Places map
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              The{" "}
              <Link href="/places" className="text-civic-blue hover:underline">
                Places map
              </Link>{" "}
              is the geographic civic twin — offices, problems, projects and reports as layers.
            </p>
          </div>
        </div>
        <ul className="mt-6 grid gap-px bg-paper-border">
          <li>
            <Link
              href="/projects/allen-avenue-spur-rehabilitation"
              className="plane-link block bg-civic-greenSoft px-5 py-4 text-ink no-underline"
            >
              Signature road project thread
            </Link>
          </li>
          <li>
            <Link href="/ask" className="plane-link block bg-civic-blueSoft px-5 py-4 text-ink no-underline">
              Ask with citations
            </Link>
          </li>
          <li>
            <Link
              href="/people/bola-ahmed-tinubu"
              className="plane-link block bg-civic-amberSoft px-5 py-4 text-ink no-underline"
            >
              Public Personality Profile — Tinubu
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
