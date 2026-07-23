import type { Metadata } from "next";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Privacy Policy", description: "Bizovix privacy policy page for responsible data handling information.", path: "/privacy-policy" });

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" intro="Bizovix is prepared to handle business inquiry data responsibly. This placeholder should be reviewed by qualified counsel before production legal use." items={["Demo and contact forms collect business contact details and operational context.", "Optional environment values are safely handled when absent.", "Future backend integrations should document storage, retention, and user rights clearly."]} />;
}

function PolicyPage({ title, intro, items }: { title: string; intro: string; items: string[] }) {
  return (
    <>
      <PageHero badge="Legal" title={title} description={intro} />
      <section className="section"><div className="container-shell article-body"><h2>Key points</h2>{items.map((item) => <p key={item}>{item}</p>)}</div></section>
    </>
  );
}
