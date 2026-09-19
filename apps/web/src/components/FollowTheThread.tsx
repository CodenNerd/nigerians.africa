import Link from "next/link";
import type { ThreadNode } from "@nigeria-for-nigerians/domain";
import { SectionHead } from "@/components/ui";

export function FollowTheThread({
  nodes,
  title = "Follow the thread",
}: {
  nodes: ThreadNode[];
  title?: string;
}) {
  if (!nodes.length) return null;
  return (
    <section aria-labelledby="thread-heading">
      <SectionHead
        title={title}
        subtitle="Move between connected records in the public graph."
        meta={`${nodes.length} steps`}
      />
      <ol className="mt-6 grid gap-px bg-paper-border">
        {nodes.map((node, i) => (
          <li
            key={`${node.type}-${node.id}-${i}`}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)] bg-civic-greenSoft sm:grid-cols-[3rem_minmax(0,1fr)]"
          >
            <div className="flex items-start justify-center bg-civic-green/15 px-2 py-4 font-mono text-xs text-civic-green">
              {i + 1}
            </div>
            <div className="relative px-5 py-4">
              <span className="absolute left-0 top-0 h-full w-1 bg-civic-green" />
              <div className="pl-2 text-[10px] font-medium uppercase tracking-[0.2em] text-civic-green">
                {node.relationship?.replace(/_/g, " ") || node.type}
              </div>
              <Link
                href={node.href}
                className="mt-1.5 block pl-2 font-display text-xl text-ink no-underline hover:text-civic-green"
              >
                {node.label}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
