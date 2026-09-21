import { store } from "@nigeria-for-nigerians/domain";
import { NextRequest, NextResponse } from "next/server";

type HistoryTurn = { role: "user" | "assistant"; content: string };
type Body = { question?: string; context?: string; history?: HistoryTurn[] };

function retrieve(question: string, context?: string) {
  const q = `${question} ${context ?? ""}`.trim();
  const hits = store.search(q);
  const thread = store.signatureThread();

  const citations = hits.slice(0, 6).map((h) => ({
    title: h.title,
    href: h.href,
    type: h.type,
  }));

  // Always include signature thread if query is about the road project
  const lower = q.toLowerCase();
  if (
    lower.includes("allen") ||
    lower.includes("road") ||
    lower.includes("abandoned") ||
    lower.includes("project") ||
    lower.includes("ikeja") ||
    lower.includes("money") ||
    lower.includes("responsible")
  ) {
    for (const n of thread.slice(0, 5)) {
      if (!citations.find((c) => c.href === n.href)) {
        citations.push({ title: n.label, href: n.href, type: n.type });
      }
    }
  }

  const project = store.projectBySlug("allen-avenue-spur-rehabilitation");
  const alloc = store.allocationBySlug("alloc-allen-avenue-spur");
  const office = store.officeBySlug("commissioner-works-lagos");
  const person = store.personBySlug("tunde-adebayo");

  let answer =
    "Based on the structured public record retrieved for your question:\n\n";

  if (project && (lower.includes("project") || lower.includes("allen") || lower.includes("road") || lower.includes("happen") || lower.includes("delay") || context?.toLowerCase().includes("allen"))) {
    answer += `The project “${project.name}” is currently recorded as ${project.status.replace(/_/g, " ")}. `;
    answer += `Approved funding is ${store.formatNaira(project.approvedAmount)}; released ${store.formatNaira(project.releasedAmount)}; reported spend ${store.formatNaira(project.reportedSpend)}. `;
    if (alloc?.gapNote) answer += `${alloc.gapNote} `;
    if (office) answer += `Responsible office: ${office.name}. `;
    if (person) answer += `Current associated office holder in the seed record: ${person.fullName}. `;
    answer +=
      "Citizen reports with photographs are connected to the project, and an official response acknowledges delay citing a contractor dispute. ";
    answer +=
      "This summary is assembled from platform records — inspect the cited sources rather than treating AI text as the system of record.";
  } else if (hits.length) {
    answer += `Found ${hits.length} related records. Top matches: ${hits
      .slice(0, 3)
      .map((h) => h.title)
      .join("; ")}. `;
    answer +=
      "Open the citations below to inspect evidence, status labels, and relationships. Where evidence is thin, the record says so explicitly.";
  } else {
    answer =
      "The public record does not contain enough evidence to answer this question from structured sources. Try a different query, or browse Government, Problems, Projects, or Places.";
  }

  return {
    answer,
    citations,
    related: hits.slice(0, 8).map((h) => ({ title: h.title, href: h.href, type: h.type })),
  };
}

async function maybeLlm(
  question: string,
  retrieval: ReturnType<typeof retrieve>,
  history: HistoryTurn[] = [],
) {
  const key = process.env.AI_API_KEY;
  if (!key) return null;

  const base = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  const system = `You are the Ask assistant for NigeriaForNigerians, a public civic record.
Rules:
- Only use the provided retrieved records. Never invent sources, amounts, or verdicts.
- Distinguish official record, reported, unverified, disputed.
- Do not declare guilt or fraud.
- Always point readers back to citations.
- Label uncertainty clearly.
- Keep answers concise (under 220 words).
- You may use prior chat turns for continuity, but still ground claims in retrieved records.`;

  const prior = history
    .slice(-6)
    .filter((t) => t.content.trim())
    .map((t) => ({
      role: t.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: t.content.slice(0, 1200),
    }));

  const user = `Question: ${question}

Retrieved records:
${retrieval.citations.map((c, i) => `${i + 1}. [${c.type}] ${c.title} (${c.href})`).join("\n")}

Draft structured summary from retrieval:
${retrieval.answer}`;

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [{ role: "system", content: system }, ...prior, { role: "user", content: user }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  const question = (body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "Question required" }, { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const retrieval = retrieve(question, body.context);
  const llm = await maybeLlm(question, retrieval, history);

  return NextResponse.json({
    answer: llm ?? retrieval.answer,
    mode: llm ? "llm" : "retrieval",
    citations: retrieval.citations,
    related: retrieval.related,
  });
}
