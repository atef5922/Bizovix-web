import type { Metadata } from "next";
import { SolutionExplorer } from "@/components/sections/InteractiveSections";
import { CTASection, PageHero } from "@/components/sections/MarketingSections";
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
      <section className="section"><div className="container-shell"><SolutionExplorer /></div></section>
      <CTASection />
    </>
  );
}
