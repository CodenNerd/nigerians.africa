import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, RelatedLinks, Timeline } from "@/components/RecordPage";
import { FollowTheThread } from "@/components/FollowTheThread";
import { EntityList } from "@/components/ui";

export function generateStaticParams() {
  return store.allOffices().map((o) => ({ slug: o.slug }));
}

export default async function OfficePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const office = store.officeBySlug(slug);
  if (!office) notFound();

  const institution = store.allInstitutions().find((i) => i.id === office.institutionId);
  const holder = store.currentHolder(office.id);
  const tenures = store.tenuresForOffice(office.id);
  const problems = store.allProblems().filter((p) => p.officeIds.includes(office.id));
  const projects = store.allProjects().filter((p) => p.responsibleOfficeId === office.id);
  const responses = store.responsesFor("office", office.id);
  const related = store.related("office", office.id);
  const foiActions = store
    .actions()
    .filter((a) => a.type === "foi" && a.entityType === "office" && a.entityId === office.id);
  const foiUrl = office.foiPortalUrl ?? institution?.foiPortalUrl;
  const contactNotes = office.contactNotes ?? institution?.contactNotes;
  const transparencyNotes = office.transparencyNotes ?? institution?.transparencyNotes;

  return (
    <RecordPage
      eyebrow="Government office · digital twin"
      title={office.name}
      subtitle={institution ? `${institution.name} · ${office.level}` : office.level}
      askContext={office.name}
      actions={[
        {
          label: "Report something related",
          href: `/report?office=${office.id}`,
        },
        {
          label: "Start FOI request",
          href: `/report?kind=foi&office=${office.id}`,
        },
        { label: "FOI guidance", href: "/guidance/freedom-of-information" },
      ]}
    >
      <RecordSection title="What this office does">
        <p className="prose-record">{office.mandate}</p>
      </RecordSection>

      <RecordSection title="Responsibilities">
        <ul className="list-disc space-y-1 pl-5 text-ink-muted">
          {office.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </RecordSection>

      <RecordSection
        title="Transparency & FOI"
        subtitle="Everyday citizens should know how to ask what is happening here — Freedom of Information pathways."
      >
        <div className="grid gap-px bg-paper-border">
          <div className="bg-civic-blueSoft p-5">
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-civic-blue">
              Contact / FOI
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              {contactNotes ?? "Use the FOI Act pathways that apply to this level of government."}
            </p>
            {foiUrl ? (
              <p className="mt-3 text-sm">
                <a href={foiUrl} className="text-civic-blue hover:underline" rel="noopener noreferrer" target="_blank">
                  Institutional portal →
                </a>
              </p>
            ) : null}
            <p className="mt-4">
              <Link
                href={`/report?kind=foi&office=${office.id}`}
                className="inline-block bg-civic-blue px-4 py-2 text-sm text-white no-underline hover:brightness-110"
              >
                Start FOI on NigeriaForNigerians
              </Link>
            </p>
          </div>
          {transparencyNotes ? (
            <div className="bg-civic-amberSoft p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-civic-amber">
                What is already public
              </div>
              <p className="mt-2 text-sm text-ink-muted">{transparencyNotes}</p>
            </div>
          ) : null}
        </div>
        {foiActions.length ? (
          <div className="mt-6">
            <h3 className="font-display text-lg text-ink">FOI actions on this office</h3>
            <EntityList
              items={foiActions.map((a) => ({
                href: `/action#${a.id}`,
                title: a.title,
                description: a.description,
                kind: a.status.replace(/_/g, " "),
                date: a.createdAt,
                tone: "blue" as const,
              }))}
            />
          </div>
        ) : null}
      </RecordSection>

      <RecordSection title="Current office holder">
        {holder ? (
          <Link
            href={`/people/${holder.slug}`}
            className="font-display text-2xl text-civic-green hover:underline"
          >
            {holder.fullName}
          </Link>
        ) : (
          <p className="text-ink-muted">No current holder in the seed record.</p>
        )}
      </RecordSection>

      <RecordSection title="Historical tenures">
        <Timeline
          items={tenures.map((t) => {
            const person = store.raw.people.find((p) => p.id === t.personId);
            return {
              date: `${t.startDate}${t.endDate ? ` – ${t.endDate}` : " – present"}`,
              title: person?.fullName ?? t.personId,
              description: t.appointmentType,
            };
          })}
        />
      </RecordSection>

      {responses.length ? (
        <RecordSection title="Official responses" meta={`${responses.length}`}>
          <ul className="grid gap-px bg-paper-border">
            {responses.map((r) => (
              <li key={r.id} className="bg-civic-greenSoft p-5">
                <time className="font-mono text-xs text-civic-green">{r.publishedAt}</time>
                <p className="mt-2 text-ink">{r.statement}</p>
              </li>
            ))}
          </ul>
        </RecordSection>
      ) : null}

      <RecordSection title="Problems">
        <RelatedLinks
          items={problems.map((p) => ({
            href: `/problems/${p.slug}`,
            label: p.title,
            hint: p.category,
          }))}
        />
      </RecordSection>

      <RecordSection title="Projects">
        <RelatedLinks
          items={projects.map((p) => ({
            href: `/projects/${p.slug}`,
            label: p.name,
            hint: p.status.replace(/_/g, " "),
          }))}
        />
      </RecordSection>

      <FollowTheThread nodes={related} />
    </RecordPage>
  );
}
