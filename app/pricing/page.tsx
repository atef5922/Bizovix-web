import type { Metadata } from "next";
import { PricingToggle } from "@/components/sections/InteractiveSections";
import { CTASection, PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Pricing",
  description: "Review Bizovix ERP pricing paths for SMEs, production companies, and enterprise operations with implementation-led scoping.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <PageHero badge="Pricing" title="ERP pricing shaped around your operating scope" description="Modules, users, branches, implementation, migration, training, and reporting needs are reviewed before a responsible quote is prepared." />
      <section className="section"><div className="container-shell"><PricingToggle /></div></section>
      <section className="section soft"><div className="container-shell"><SectionHeading title="What affects ERP scope?" description="Number of companies, branches, warehouses, users, approval rules, historical data, reporting needs, and integrations all shape implementation planning." /></div></section>
      <CTASection title="Request a pricing conversation with real context" />
    </>
  );
}
