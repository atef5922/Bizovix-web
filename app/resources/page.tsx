import type { Metadata } from "next";
import { ResourceExplorer } from "@/components/sections/InteractiveSections";
import { CTASection, PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Resources",
  description: "Read Bizovix ERP guides, checklists, product updates, and planning resources for growing companies.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <>
      <PageHero badge="Resources" title="ERP planning resources for better decisions" description="Use guides, case-style scenarios, checklists, and product notes to prepare your team for a more productive ERP evaluation." />
      <section className="section"><div className="container-shell"><ResourceExplorer /></div></section>
      <CTASection />
    </>
  );
}
