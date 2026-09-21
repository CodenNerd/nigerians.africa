import { PageIntro } from "@/components/ui";
import { FollowingManager } from "./FollowingManager";

export const metadata = { title: "Following" };

export default function FollowingPage() {
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Updates by email"
        title="Following"
        subtitle="Records you opted into — change cadence or unfollow. Every email includes an unsubscribe link."
      />
      <FollowingManager />
    </div>
  );
}
