import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro, SectionHead, EntityList } from "@/components/ui";

export const metadata = { title: "Government" };

export default function GovernmentPage() {
  const institutions = store.allInstitutions();
  const federal = institutions.filter((i) => i.level === "federal");
  const state = institutions.filter((i) => i.level === "state");
  const local = institutions.filter((i) => i.level === "local");
  const offices = store.allOffices();

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Government"
        subtitle="Government as a navigable system: institution → office → office holder → responsibility → records."
        meta={`${institutions.length} institutions · ${offices.length} offices`}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-3">
        {(
          [
            { title: "Federal", items: federal, tone: "bg-civic-greenSoft" },
            { title: "State", items: state, tone: "bg-civic-blueSoft" },
            { title: "Local", items: local, tone: "bg-civic-amberSoft" },
          ] as const
        ).map((col) => (
          <section key={col.title}>
            <h2 className="font-display text-2xl tracking-tight text-ink">{col.title}</h2>
            <ul className="mt-4 grid max-h-[28rem] gap-px overflow-y-auto bg-paper-border">
              {col.items.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/government/institutions/${i.slug}`}
                    className={`plane-link block ${col.tone} px-4 py-3 text-sm text-ink no-underline`}
                  >
                    {i.name}
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-ink-faint">
                      {i.type}
                    </span>
                  </Link>
                </li>
              ))}
              {!col.items.length ? (
                <li className="bg-paper px-4 py-3 text-sm text-ink-faint">None in this record yet.</li>
              ) : null}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-16">
        <SectionHead
          title="Offices"
          subtitle="Current holders shown when present in the record."
          meta={`${offices.length}`}
        />
        <EntityList
          items={offices.slice(0, 60).map((o) => {
            const holder = store.currentHolder(o.id);
            return {
              href: `/government/offices/${o.slug}`,
              title: o.name,
              description: o.mandate,
              kind: o.level,
              tone: "blue" as const,
              meta: holder ? (
                <span>
                  Current holder:{" "}
                  <Link href={`/people/${holder.slug}`} className="text-civic-green hover:underline">
                    {holder.fullName}
                  </Link>
                </span>
              ) : (
                <span className="text-ink-faint">No current holder in seed record</span>
              ),
            };
          })}
        />
        {offices.length > 60 ? (
          <p className="mt-4 font-mono text-xs text-ink-faint">
            Showing 60 of {offices.length} offices — open an institution for the full set.
          </p>
        ) : null}
      </section>
    </div>
  );
}
