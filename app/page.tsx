import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, Factory, Layers3, PlayCircle, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { DemoModalButton } from "@/components/ui/SiteTools";
import { DashboardShowcase } from "@/components/product/DashboardShowcase";
import { CTASection, SectionHeading, TrustBand, WorkflowBand } from "@/components/sections/MarketingSections";
import { BlogExplorer, FAQAccordion, IndustrySelector, PricingToggle, ResourceExplorer, SolutionExplorer } from "@/components/sections/InteractiveSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { faqJsonLd, pageMetadata } from "@/src/lib/seo";
import { faqs } from "@/src/data/faqs";

export const metadata: Metadata = pageMetadata({
  title: "Cloud ERP Software in Bangladesh",
  description: "Bizovix connects accounting, inventory, purchase, manufacturing, sales, POS, HR, payroll, clients, vendors, dashboards, and approvals in one cloud ERP platform.",
});

export default function Home() {
  return (
    <>
      <SEOJsonLd data={faqJsonLd(faqs)} />
      <section className="hero">
        <div className="container-shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Cloud ERP for Bangladesh and Beyond</p>
            <h1>Premium Cloud ERP for Finance, Inventory, Production, and Growth</h1>
            <p className="hero-lead">
              Bizovix brings accounting, purchase, inventory, manufacturing, sales, POS, HR, payroll, approvals, and reporting into one polished operating system for serious teams.
            </p>
            <div className="button-row">
              <ButtonLink href="/demo-request">Request a Free Demo <ArrowRight className="h-4 w-4" /></ButtonLink>
              <ButtonLink href="/solutions" variant="secondary">Explore Solutions</ButtonLink>
              <DemoModalButton label="Watch Product Tour" />
            </div>
            <div className="microcopy">
              <span><CheckCircle2 className="h-4 w-4 text-[var(--success)]" />Personalized consultation</span>
              <span><CheckCircle2 className="h-4 w-4 text-[var(--success)]" />No credit card required</span>
            </div>
            <div className="hero-proof" aria-label="Bizovix platform highlights">
              <span><ShieldCheck className="h-4 w-4" /> Secure approvals</span>
              <span><Factory className="h-4 w-4" /> Production-ready</span>
              <span><Building2 className="h-4 w-4" /> Multi-branch control</span>
            </div>
          </div>
          <div className="hero-visual">
            <DashboardShowcase />
          </div>
        </div>
      </section>

      <section className="signal-band" aria-label="ERP capability summary">
        <div className="container-shell signal-grid">
          {[
            ["Core modules", "12+", "Finance, stock, sales, HR, production"],
            ["Operating view", "Live", "Dashboards, approvals, and alerts"],
            ["Rollout model", "Modular", "Start focused and expand cleanly"],
            ["Business fit", "BD + Global", "Local operations, scalable controls"],
          ].map(([label, value, body]) => (
            <article key={label}>
              <Layers3 className="h-5 w-5" />
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <TrustBand />

      <section className="section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Operational clarity"
            title="Replace scattered files, disconnected teams, and delayed reports with one operating record"
            description="Bizovix helps production, finance, warehouse, sales, purchase, HR, and leadership teams understand the same business reality."
          />
          <div className="card-grid">
            {[
              ["Finance waits for stock updates", "Inventory valuation, purchase bills, invoices, and receivables need to move together."],
              ["Production lacks material visibility", "Work orders become easier to plan when raw materials, purchase, warehouse, and costing are connected."],
              ["Leadership sees reports too late", "Dashboards should surface sales trends, production progress, stock alerts, approvals, and attendance quickly."],
              ["Branches work in separate systems", "Multi-branch and multi-company operations need shared controls without losing local context."],
            ].map(([title, body]) => (
              <article className="feature-card" key={title}>
                <PlayCircle className="h-6 w-6 text-[var(--primary)]" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Solutions"
            title="ERP modules built around the way real businesses operate"
            description="Explore finance, commerce, production, warehouse, people, client, and vendor workflows from one organized platform."
          />
          <SolutionExplorer />
        </div>
      </section>

      <WorkflowBand />

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Industries"
            title="Designed for production companies, SMEs, and enterprise operations"
            description="Bizovix content is tailored to Bangladesh-relevant business models while keeping the platform ready for global operations."
          />
          <IndustrySelector />
        </div>
      </section>

      <section className="section">
        <div className="container-shell two-column">
          <div>
            <SectionHeading
              eyebrow="Implementation"
              title="A serious ERP rollout needs consultation, configuration, training, and adoption support"
              description="The Bizovix journey is demo-led so your team can discuss modules, users, branches, data migration, reporting needs, and rollout priorities before choosing a plan."
            />
            <div className="button-row">
              <ButtonLink href="/demo-request">Plan Your Demo</ButtonLink>
              <ButtonLink href="/resources/checklists" variant="secondary">Use Checklist</ButtonLink>
            </div>
          </div>
          <DashboardShowcase compact />
        </div>
      </section>

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent paths without unsupported fixed-price promises"
            description="ERP scope depends on modules, users, branches, migration, training, and integrations. Bizovix keeps pricing tied to the implementation reality."
          />
          <PricingToggle />
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <SectionHeading eyebrow="Resources" title="Helpful ERP planning content for decision makers" description="Guides, checklists, updates, and practical articles help teams prepare for a more productive demo." />
          <ResourceExplorer />
        </div>
      </section>

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading eyebrow="Blog" title="Practical ERP articles for operations, finance, and production teams" />
          <BlogExplorer />
        </div>
      </section>

      <section className="section">
        <div className="container-shell two-column">
          <SectionHeading eyebrow="FAQ" title="Questions teams usually ask before an ERP demo" description="Straight answers, no inflated claims." />
          <FAQAccordion />
        </div>
      </section>

      <CTASection />
    </>
  );
}
