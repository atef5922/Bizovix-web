import type { Metadata } from "next";
import { BlogExplorer } from "@/components/sections/InteractiveSections";
import { CTASection, PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Blog",
  description: "Practical Bizovix ERP articles for manufacturing, accounting, inventory, purchasing, POS, HR, payroll, and business operations.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <PageHero badge="Blog" title="ERP ideas for operations, finance, and production teams" description="Helpful articles designed for business decision makers preparing to modernize connected workflows." />
      <section className="section"><div className="container-shell"><BlogExplorer /></div></section>
      <CTASection />
    </>
  );
}
