import type { ProjectStatus } from "@nigeria-for-nigerians/domain";

const CORE: ProjectStatus[] = ["planned", "started", "in_progress", "completed"];
const RISK: ProjectStatus[] = ["delayed", "abandoned", "cancelled"];

export function WorkJourney({
  status,
  statusHistory,
}: {
  status: ProjectStatus;
  statusHistory: { status: ProjectStatus; effectiveAt: string; reason: string }[];
}) {
  const reached = new Set(statusHistory.map((h) => h.status));
  reached.add(status);
  const onRisk = RISK.includes(status);

  return (
    <div>
      <ol className="flex flex-wrap items-stretch gap-px bg-paper-border" aria-label="Work journey">
        {CORE.map((step, i) => {
          const isCurrent =
            status === step || (step === "in_progress" && (status === "delayed" || status === "abandoned"));
          const done = reached.has(step) || isCurrent;
          return (
            <li
              key={step}
              className={`relative min-w-[6.5rem] flex-1 px-3 py-4 sm:min-w-[7.5rem] sm:px-4 ${
                isCurrent
                  ? "bg-civic-greenSoft"
                  : done
                    ? "bg-paper-card"
                    : "bg-paper"
              }`}
            >
              {isCurrent ? (
                <span className="absolute left-0 top-0 h-full w-1 bg-civic-green" aria-hidden />
              ) : null}
              <span className="font-mono text-[10px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              <p
                className={`mt-1 text-sm font-medium capitalize ${
                  isCurrent ? "text-civic-green" : done ? "text-ink" : "text-ink-faint"
                }`}
              >
                {step.replace(/_/g, " ")}
              </p>
              {isCurrent ? (
                <p className="mt-1 text-[10px] uppercase tracking-wider text-civic-green">Now</p>
              ) : done ? (
                <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-faint">Reached</p>
              ) : (
                <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-faint">Ahead</p>
              )}
            </li>
          );
        })}
      </ol>

      {onRisk ? (
        <div className="mt-px flex items-stretch gap-px bg-paper-border">
          <div className="relative flex-1 bg-civic-redSoft px-3 py-4 sm:px-4">
            <span className="absolute left-0 top-0 h-full w-1 bg-civic-red" aria-hidden />
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-civic-red">
              Branch · {status}
            </p>
            <p className="mt-1 text-sm text-civic-red">
              Work left the main path — see timeline for the recorded reason.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
