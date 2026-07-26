import type { Metadata } from "next";
import { SolutionExplorer } from "@/components/sections/InteractiveSections";
import { CTASection, PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Solutions",
  description: "Explore Bizovix ERP modules for accounting, purchase, inventory, manufacturing, sales, POS, HR, payroll, clients, and vendors.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <PageHero badge="Solutions" title="Connected ERP modules for every operating team" description="Choose the workflows your company needs now and expand into a complete business operating platform over time." />
      <section className="section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="ERP modules"
            title="Explore the workflows Bizovix connects"
            description="Start with one department or connect the full operating cycle across finance, purchase, inventory, manufacturing, sales, POS, HR, payroll, clients, and vendors."
          />
          <SolutionExplorer />
        </div>
      </section>
      <CTASection />
    </>
  );
}
