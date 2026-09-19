import { AskPanel } from "@/components/AskPanel";
import { FollowTheThread } from "@/components/FollowTheThread";
import { store } from "@nigeria-for-nigerians/domain";

export const metadata = { title: "Ask" };

export default function AskPage() {
  return (
    <div className="site-container py-12">
      <h1 className="font-display text-4xl text-ink">Ask the public record</h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        AI organises, summarises and connects — it does not invent sources or decide guilt. Answers
        are labelled AI Generated and cite underlying records.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <AskPanel context="NigeriaForNigerians public record. Signature thread: Allen Avenue spur." />
          <div className="border border-paper-border bg-paper-card p-5 text-sm text-ink-muted">
            <p className="font-medium text-ink">Example questions</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>What happened to the abandoned road project in Ikeja?</li>
              <li>Who is responsible for Allen Avenue spur?</li>
              <li>How much money was allocated and released?</li>
              <li>What evidence exists?</li>
            </ul>
          </div>
        </div>
        <FollowTheThread nodes={store.signatureThread()} title="Signature thread" />
      </div>
    </div>
  );
}
