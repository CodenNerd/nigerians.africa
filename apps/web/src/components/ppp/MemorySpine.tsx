import type { MemoryEvent } from "@nigeria-for-nigerians/domain";
import { SectionHead } from "./visual";

const eventTone: Record<string, { plane: string; ink: string; accent: string }> = {
  Appointment: { plane: "bg-civic-greenSoft", ink: "text-civic-green", accent: "bg-civic-green" },
  Promise: { plane: "bg-civic-amberSoft", ink: "text-civic-amber", accent: "bg-civic-amber" },
  Statement: { plane: "bg-civic-blueSoft", ink: "text-civic-blue", accent: "bg-civic-blue" },
  Outcome: { plane: "bg-paper", ink: "text-civic-slate", accent: "bg-civic-slate" },
  Decision: { plane: "bg-civic-blueSoft", ink: "text-civic-blue", accent: "bg-civic-blue" },
  Budget: { plane: "bg-civic-amberSoft", ink: "text-civic-amber", accent: "bg-civic-amber" },
  "Citizen Report": { plane: "bg-civic-redSoft", ink: "text-civic-red", accent: "bg-civic-red" },
  "Official Response": { plane: "bg-civic-blueSoft", ink: "text-civic-blue", accent: "bg-civic-blue" },
  "Project Start": { plane: "bg-civic-greenSoft", ink: "text-civic-green", accent: "bg-civic-green" },
};

function tone(eventType: string) {
  return (
    eventTone[eventType] ?? {
      plane: "bg-paper",
      ink: "text-ink",
      accent: "bg-ink-faint",
    }
  );
}

export function MemorySpine({ events }: { events: MemoryEvent[] }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section id="memory" className="scroll-mt-28">
      <SectionHead
        title="Political memory"
        subtitle="Chronological spine of appointments, promises, statements and outcomes."
        meta={`${sorted.length} events`}
      />

      {sorted.length === 0 ? (
        <p className="mt-6 text-ink-muted">No memory events yet.</p>
      ) : (
        <ol className="mt-6">
          {sorted.map((m, i) => {
            const t = tone(m.eventType);
            const year = m.date.slice(0, 4);
            const showYear = i === 0 || sorted[i - 1].date.slice(0, 4) !== year;
            return (
              <li key={m.id}>
                {showYear ? (
                  <div className="sticky top-[8.5rem] z-10 -mx-1 border-y border-paper-border bg-paper/92 px-1 py-2.5 backdrop-blur-md">
                    <span className="font-display text-4xl tracking-tight text-ink sm:text-5xl">{year}</span>
                  </div>
                ) : null}
                <div className={`grid grid-cols-[4.5rem_minmax(0,1fr)] gap-0 sm:grid-cols-[6rem_minmax(0,1fr)]`}>
                  <div className={`flex items-start justify-end ${t.plane} px-3 py-5`}>
                    <span className={`font-mono text-xs ${t.ink}`}>{m.date.slice(5)}</span>
                  </div>
                  <div className="relative border-b border-paper-border bg-paper-card py-5 pl-5 pr-4">
                    <span className={`absolute left-0 top-0 h-full w-1 ${t.accent}`} />
                    <span className={`text-[10px] font-medium uppercase tracking-[0.2em] ${t.ink}`}>
                      {m.eventType}
                    </span>
                    <p className="mt-2 font-display text-xl leading-snug text-ink sm:text-2xl">
                      {m.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
