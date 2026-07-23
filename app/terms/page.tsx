import type { Metadata } from "next";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Terms", description: "Bizovix terms page prepared for SaaS website use.", path: "/terms" });

export default function TermsPage() {
  return (
    <>
      <PageHero badge="Legal" title="Terms" description="This terms page is prepared for the Bizovix marketing website and should be reviewed by qualified counsel before production legal use." />
      <section className="section"><div className="container-shell article-body"><h2>Website use</h2><p>Visitors may use the website to learn about Bizovix ERP, request demos, contact the team, and review resources.</p><h2>Product discussions</h2><p>ERP proposals, pricing, scope, implementation, and service terms should be confirmed through an official agreement.</p></div></section>
    </>
  );
}
