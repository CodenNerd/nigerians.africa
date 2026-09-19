"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";

function ReportForm() {
  const params = useSearchParams();
  const kind = params.get("kind") ?? "";
  const officeId = params.get("office") ?? "";
  const personId = params.get("person") ?? "";
  const problemId = params.get("problem") ?? "";
  const electionId = params.get("election") ?? "";
  const puId = params.get("pu") ?? "";

  const office = officeId ? store.allOffices().find((o) => o.id === officeId) : undefined;
  const person = personId ? store.raw.people.find((p) => p.id === personId) : undefined;
  const problem = problemId ? store.problemBySlug(problemId) || store.allProblems().find((p) => p.id === problemId) : undefined;
  const election = electionId ? store.eventBySlug(electionId) || store.events().find((e) => e.id === electionId) : undefined;
  const pu = puId
    ? store.locations().find((l) => l.id === puId || l.slug === puId)
    : undefined;

  const defaultTitle = useMemo(() => {
    if (kind === "foi" && office) return `FOI request — ${office.name}`;
    if (kind === "bribery") return "Observed bribery / solicitation";
    if (election && pu) return `Observer count — ${pu.name}`;
    if (problem) return `Observation — ${problem.title}`;
    return "";
  }, [kind, office, election, pu, problem]);

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(
    pu?.name || office?.name || "Ikeja, Lagos (auto-detected demo)",
  );
  const [targetOffice, setTargetOffice] = useState(officeId);
  const [targetProblem, setTargetProblem] = useState(problem?.id ?? problemId);
  const [fileLabel, setFileLabel] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "auth" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          kind: kind || undefined,
          officeId: targetOffice || undefined,
          personId: personId || undefined,
          problemId: targetProblem || undefined,
          electionId: election?.id || electionId || undefined,
          pollingUnitId: pu?.id || undefined,
          fileLabel: fileLabel || undefined,
          mediaType: mediaType || undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setStatus("auth");
        setMessage("Sign in is required to submit. Authentication is for participation, not browsing.");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("ok");
      setMessage(
        `Report ${data.report.id} submitted — status: ${data.report.status}. It now appears on Action (live demo submissions). Pool accountability: your evidence can help vetted NGOs and FOI follow-ups.`,
      );
      setDescription("");
    } catch {
      setStatus("error");
      setMessage("Could not submit report.");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-center font-display text-4xl text-ink">See something?</h1>
      <p className="mt-3 text-center text-ink-muted">
        Photo, video or text. Pool accountability starts here — capture what is wrong around you and
        connect it to an office, problem or polling unit.
      </p>

      {(kind || office || problem || election) && (
        <div className="mt-6 bg-civic-blueSoft px-4 py-3 text-sm text-civic-blue">
          {kind === "foi" ? "FOI request mode · " : null}
          {office ? `Office: ${office.name}. ` : null}
          {problem ? `Problem: ${problem.title}. ` : null}
          {person ? `Person: ${person.fullName}. ` : null}
          {election ? `Election: ${election.title}. ` : null}
          {pu ? `Polling unit: ${pu.name}.` : null}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4 bg-civic-greenSoft p-6">
        <div>
          <label className="text-[10px] uppercase tracking-[0.18em] text-ink-faint" htmlFor="title">
            Short title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper/80 px-3 py-2 outline-none focus:border-civic-green"
            placeholder="Policeman soliciting bribe on Allen Avenue"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.18em] text-ink-faint" htmlFor="desc">
            What happened?
          </label>
          <textarea
            id="desc"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper/80 px-3 py-2 outline-none focus:border-civic-green"
            placeholder="Describe what you saw. For FOI, state the documents you need."
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.18em] text-ink-faint" htmlFor="loc">
            Location
          </label>
          <input
            id="loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper/80 px-3 py-2 outline-none focus:border-civic-green"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.18em] text-ink-faint" htmlFor="office">
            Related office (optional)
          </label>
          <select
            id="office"
            value={targetOffice}
            onChange={(e) => setTargetOffice(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper/80 px-3 py-2 outline-none focus:border-civic-green"
          >
            <option value="">— None —</option>
            {store.allOffices().slice(0, 40).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.18em] text-ink-faint" htmlFor="problem">
            Related problem (optional)
          </label>
          <select
            id="problem"
            value={targetProblem}
            onChange={(e) => setTargetProblem(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper/80 px-3 py-2 outline-none focus:border-civic-green"
          >
            <option value="">— None —</option>
            {store.allProblems().map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.18em] text-ink-faint" htmlFor="media">
            Photo / video (demo stub)
          </label>
          <input
            id="media"
            type="file"
            accept="image/*,video/*"
            className="mt-1 block w-full text-sm text-ink-muted"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) {
                setFileLabel("");
                setMediaType("");
                return;
              }
              setFileLabel(f.name);
              setMediaType(f.type.startsWith("video") ? "Video" : "Photo");
            }}
          />
          <p className="mt-2 text-xs text-ink-faint">
            Files are not uploaded to a CDN in this demo — we record the filename as evidence
            metadata on your report so the Action feed shows the attachment stub.
            {fileLabel ? ` Attached: ${fileLabel}` : ""}
          </p>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-civic-green py-3 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit to the public record"}
        </button>
      </form>

      {message ? (
        <div
          className={`mt-4 px-4 py-3 text-sm ${
            status === "ok"
              ? "bg-civic-greenSoft text-civic-green"
              : status === "auth"
                ? "bg-civic-amberSoft text-civic-amber"
                : "bg-civic-redSoft text-civic-red"
          }`}
        >
          {message}{" "}
          {status === "auth" ? (
            <Link href="/signin" className="font-medium underline">
              Sign in
            </Link>
          ) : null}
          {status === "ok" ? (
            <Link href="/action#reports" className="ml-2 font-medium underline">
              View on Action →
            </Link>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-ink-faint">
        Demo: citizen@demo.ng · Related:{" "}
        <Link href="/guidance/bribery-corruption" className="text-civic-green hover:underline">
          Bribery guidance
        </Link>
      </p>
    </div>
  );
}

export default function ReportPage() {
  return (
    <div className="site-container py-12">
      <Suspense fallback={<p className="text-center text-ink-muted">Loading…</p>}>
        <ReportForm />
      </Suspense>
    </div>
  );
}
