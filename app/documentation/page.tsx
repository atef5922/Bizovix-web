import type { Metadata } from "next";
import { CTASection, PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Documentation",
  description: "Browse Bizovix ERP documentation topics for accounting setup, inventory controls, manufacturing workflows, approval rules, dashboards, and implementation planning.",
  path: "/documentation",
});

export default function DocumentationPage() {
  return (
    <>
      <PageHero
        badge="Documentation"
        title={<>Bizovix <span className="title-accent">documentation hub</span></>}
        description="A prepared home for module guides, workflow setup notes, implementation handbooks, and future customer-facing product documentation."
      />
      <section className="section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Knowledge base"
            title={<>ERP documentation areas prepared for <span className="title-accent">scale</span></>}
            description="These documentation paths help teams evaluate Bizovix before implementation and support customers after rollout."
          />
          <div className="card-grid">
            {[
              ["Accounting setup", "Chart of accounts, receivables, payables, journal flow, cash reporting, and month-end controls."],
              ["Inventory controls", "Warehouse setup, stock movement, transfers, reorder signals, batch tracking, and valuation visibility."],
              ["Manufacturing workflows", "BOM planning, work orders, material issue, production updates, quality checks, and finished goods."],
              ["Approval rules", "Purchase approvals, sales exceptions, finance checks, HR requests, and management dashboard alerts."],
              ["Dashboard reporting", "Executive summaries, branch comparison, operational queues, sales trends, and real-time decision views."],
              ["Implementation guide", "Data preparation, user access, training plans, phased rollout, and post-live support routines."],
            ].map(([title, body]) => (
              <article className="feature-card" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
