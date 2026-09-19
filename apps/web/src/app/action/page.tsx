import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { PageIntro, SectionHead, EntityList } from "@/components/ui";
import { LiveReportsList } from "@/components/LiveReportsList";

export const metadata = { title: "Action" };

export default function ActionPage() {
  const actions = store.actions();
  const reports = store.reports();
  const foiActions = actions.filter((a) => a.type === "foi");
  const otherActions = actions.filter((a) => a.type !== "foi");

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Pool accountability"
        title="Civic action"
        subtitle="Report what you see, request information, support vetted organisations — without pressure or partisan framing. Complaining is not enough; capture evidence."
      />

      <ul className="mt-10 grid gap-px bg-paper-border sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/report", label: "See something? Report it", tone: "bg-civic-greenSoft text-civic-green" },
          { href: "/guidance", label: "What should I do?", tone: "bg-civic-amberSoft text-civic-amber" },
          { href: "/guidance/freedom-of-information", label: "Start an FOI", tone: "bg-civic-blueSoft text-civic-blue" },
          { href: "/government", label: "Find who is responsible", tone: "bg-civic-blueSoft text-civic-blue" },
          { href: "/organizations", label: "Vetted NGOs", tone: "bg-civic-greenSoft text-civic-green" },
          {
            href: "/events/elections/2023-general-election-ikeja-demo",
            label: "Election evidence",
            tone: "bg-civic-amberSoft text-civic-amber",
          },
        ].map((a) => (
          <li key={a.label}>
            <Link
              href={a.href}
              className={`plane-link block px-5 py-5 text-center font-display text-xl no-underline ${a.tone}`}
            >
              {a.label}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-16" id="foi">
        <SectionHead
          title="Freedom of Information"
          subtitle="Requests to public offices — with linked evidence when answered. Newest first."
          meta={`${foiActions.length} FOI`}
        />
        <EntityList
          items={foiActions.map((a) => {
            const office =
              a.entityType === "office"
                ? store.allOffices().find((o) => o.id === a.entityId)
                : undefined;
            return {
              href: office ? `/government/offices/${office.slug}` : `/action#${a.id}`,
              title: a.title,
              description: a.description,
              kind: `FOI · ${a.status.replace(/_/g, " ")}`,
              date: a.createdAt,
              tone: "blue" as const,
              meta: (
                <span>
                  {a.userLabel}
                  {a.evidenceIds?.length ? (
                    <>
                      {" · "}
                      <Link
                        href={`/evidence/${a.evidenceIds[0]}`}
                        className="text-civic-blue hover:underline"
                      >
                        View response evidence
                      </Link>
                    </>
                  ) : null}
                </span>
              ),
            };
          })}
          empty="No FOI actions in the record yet."
        />
      </section>

      <section className="mt-16" id="reports">
        <SectionHead
          title="Published citizen reports"
          subtitle="Seed record (newest first) plus live demo submissions."
          meta={`${reports.length}+ live`}
        />
        <EntityList
          items={reports.map((r) => ({
            href: `/action#${r.id}`,
            title: r.title,
            description: r.description,
            kind: "Citizen report",
            date: r.submittedAt,
            tone: "red" as const,
            meta: <StatusLabel status={r.verificationStatus} />,
          }))}
          empty="No published seed reports yet."
        />
        <div className="mt-8">
          <h3 className="font-display text-lg text-ink">Live demo submissions</h3>
          <LiveReportsList />
        </div>
      </section>

      <section className="mt-16">
        <SectionHead
          title="Other recorded actions"
          subtitle="Follows, support and challenges — newest first."
          meta={`${otherActions.length}`}
        />
        <ul className="mt-6 grid gap-px bg-paper-border">
          {otherActions.map((a) => (
            <li key={a.id} id={a.id} className="scroll-mt-28 bg-civic-greenSoft p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-civic-green">
                {a.type} · {a.status}
              </div>
              <div className="mt-2 font-display text-xl text-ink">{a.title}</div>
              <p className="mt-2 text-sm text-ink-muted">{a.description}</p>
              <p className="mt-3 font-mono text-[11px] text-ink-faint">
                {a.userLabel} · {a.createdAt}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
