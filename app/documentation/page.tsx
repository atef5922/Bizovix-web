import type { Metadata } from "next";
import { CTASection, PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Documentation", description: "Bizovix documentation hub prepared for ERP module guides, workflow help, and implementation resources.", path: "/documentation" });

export default function DocumentationPage() {
  return (
    <>
      <PageHero badge="Documentation" title="Bizovix documentation hub" description="A prepared home for module guides, workflow setup notes, implementation handbooks, and future customer-facing product documentation." />
      <section className="section"><div className="container-shell card-grid">{["Accounting setup", "Inventory controls", "Manufacturing workflows", "Approval rules"].map((item) => <article className="feature-card" key={item}><h3>{item}</h3><p>Documentation content can expand here as product and implementation material becomes available.</p></article>)}</div></section>
      <CTASection />
    </>
  );
}
