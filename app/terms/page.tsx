import type { Metadata } from "next";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "Read Bizovix website terms prepared for ERP software downloads, product discussions, pricing conversations, implementation scope, and SaaS service communication.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero badge="Legal" title="Terms" description="This terms page is prepared for the Bizovix marketing website and should be reviewed by qualified counsel before production legal use." />
      <section className="section">
        <div className="container-shell article-body">
          <h2>Website use</h2>
          <p>Visitors may use the website to learn about Bizovix ERP, compare solutions, download ERP software, contact the team, and review educational resources.</p>
          <h2>Product discussions</h2>
          <p>ERP proposals, pricing, implementation scope, service levels, integrations, customization, and support responsibilities should be confirmed through an official agreement.</p>
          <h2>Content accuracy</h2>
          <p>Bizovix aims to keep product and marketing information clear, but final module availability, rollout plan, and commercial terms should be verified during the consultation process.</p>
          <h2>Responsible use</h2>
          <p>Visitors should not misuse website forms, attempt unauthorized access, copy restricted materials, or submit false business information.</p>
        </div>
      </section>
    </>
  );
}
