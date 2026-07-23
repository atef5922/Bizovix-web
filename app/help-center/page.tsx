import type { Metadata } from "next";
import { CTASection, PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Help Center", description: "Bizovix help center prepared for support, onboarding, implementation, and ERP workflow assistance.", path: "/help-center" });

export default function HelpCenterPage() {
  return (
    <>
      <PageHero badge="Help center" title="Support for teams adopting connected ERP workflows" description="Find prepared paths for onboarding, support, implementation questions, and product guidance." />
      <section className="section"><div className="container-shell card-grid">{["Implementation support", "Training requests", "Workflow questions", "Account assistance"].map((item) => <article className="feature-card" key={item}><h3>{item}</h3><p>Use the contact page to route the request while the full support portal is prepared.</p></article>)}</div></section>
      <CTASection />
    </>
  );
}
