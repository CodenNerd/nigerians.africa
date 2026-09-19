import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro } from "@/components/ui";
import { RecordStream } from "@/components/RecordStream";

export const metadata = { title: "Public record stream" };

export default function RecordPage() {
  const items = store.recordStream(40);

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Stream"
        subtitle="One repeating unit — kind, status, date, title, summary. Skim the archive like a dense feed without leaving the reading-room feel."
        meta={`${items.length} records`}
      />
      <div className="mt-10">
        <RecordStream
          items={items}
          showHeader={false}
          footerHref="/"
          footerLabel="← Back to home"
        />
      </div>
    </div>
  );
}
