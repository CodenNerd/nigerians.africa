import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = store.search(q);

  return (
    <div className="site-container py-12">
      <h1 className="font-display text-4xl text-ink">Search</h1>
      <p className="mt-3 text-ink-muted">
        Exact, semantic-style and relationship-aware search across the public record.
      </p>
      <form className="mt-8 max-w-2xl">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <div className="flex border border-paper-border bg-paper-card">
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="e.g. Road projects in Lagos that received funding but are incomplete"
            className="flex-1 bg-transparent px-4 py-3 outline-none"
          />
          <button type="submit" className="bg-civic-green px-5 text-sm font-medium text-white">
            Search
          </button>
        </div>
      </form>

      {q ? (
        <div className="mt-10">
          <p className="text-sm text-ink-faint">
            {results.length} results for “{q}”
          </p>
          <ul className="mt-4 divide-y divide-paper-border border border-paper-border bg-paper-card">
            {results.map((r) => (
              <li key={r.href + r.title} className="px-4 py-4">
                <div className="text-xs uppercase tracking-wider text-ink-faint">{r.type}</div>
                <Link href={r.href} className="mt-1 block text-lg text-ink hover:text-civic-green">
                  {r.title}
                </Link>
                <p className="mt-1 text-sm text-ink-muted line-clamp-2">{r.snippet}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-10 text-sm text-ink-muted">
          <p>Suggestions:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <Link href="/search?q=abandoned+road+Ikeja">abandoned road Ikeja</Link>
            </li>
            <li>
              <Link href="/search?q=electricity">electricity</Link>
            </li>
            <li>
              <Link href="/search?q=Tunde+Adebayo">Tunde Adebayo</Link>
            </li>
            <li>
              <Link href="/search?q=election+discrepancy">election discrepancy</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
