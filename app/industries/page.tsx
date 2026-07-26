import type { Metadata } from "next";
import { IndustrySelector } from "@/components/sections/InteractiveSections";
import { CTASection, PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Industries",
  description: "Explore Bizovix ERP for manufacturing, garments, pharmaceuticals, food and beverage, wholesale, retail POS, logistics, construction, e-commerce, and service businesses.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero badge="Industries" title="ERP workflows for Bangladesh-relevant industries" description="Bizovix organizes operational content around production, commerce, distribution, project, and service business realities." />
      <section className="section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Industry coverage"
            title="Choose the business model closest to your operation"
            description="Each industry page maps pain points, connected modules, and practical ERP use cases for Bangladesh and South Asia focused companies."
          />
          <IndustrySelector />
        </div>
      </section>
      <CTASection />
    </>
  );
}
