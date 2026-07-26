import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { DemoModalButton } from "@/components/ui/SiteTools";
import { Icon } from "@/components/ui/Icon";
import { workflows } from "@/src/data/workflows";
import type { Industry, Solution } from "@/src/types/site";

export function PageHero({
  badge,
  title,
  description,
  children,
}: {
  badge?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="container-shell page-hero-shell">
        <div className="page-hero-copy">
          {badge && <p className="eyebrow">{badge}</p>}
          <h1>{title}</h1>
          <p>{description}</p>
          {children}
        </div>
        <div className="page-hero-panel" aria-hidden="true">
          <span>Cloud ERP</span>
          <strong>Finance</strong>
          <strong>Inventory</strong>
          <strong>Production</strong>
          <strong>Sales</strong>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="section-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ title: string; href: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 && <span aria-hidden="true">/</span>}
          <Link href={item.href}>{item.title}</Link>
        </span>
      ))}
    </nav>
  );
}

export function CTASection({ title = "Ready to connect your business operations?", description = "Request a personalized Bizovix demo and review the workflows, modules, and implementation path that fit your company." }) {
  return (
    <section className="cta-band">
      <div className="container-shell cta-inner">
        <div className="cta-copy">
          <p className="cta-eyebrow">Demo request</p>
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="cta-points" aria-label="Demo request benefits">
            <span><CheckCircle2 className="h-4 w-4" />Workflow consultation</span>
            <span><CheckCircle2 className="h-4 w-4" />Module fit review</span>
            <span><CheckCircle2 className="h-4 w-4" />Implementation roadmap</span>
          </div>
        </div>
        <div className="cta-actions">
          <ButtonLink href="/demo-request" className="cta-primary-button">
            Request a Free Demo <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <div className="cta-secondary-wrap">
            <DemoModalButton label="Open Quick Form" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function WorkflowBand() {
  return (
    <section className="section">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Connected workflows"
          title="Business processes move together instead of waiting on manual handoffs"
          description="Bizovix is organized around the operating flows leadership teams need to see clearly."
        />
        <div className="timeline">
          {workflows.map((workflow, index) => (
            <article key={workflow.title}>
              <span>{index + 1}</span>
              <h3>{workflow.title}</h3>
              <p>{workflow.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustBand() {
  return (
    <section className="trust-band">
      <div className="container-shell trust-grid">
        {[
          ["Bangladesh-fit operations", "Designed around manufacturing, commerce, approvals, branches, and day-to-day business reality."],
          ["Modular rollout", "Start with the modules your team needs most and expand as processes mature."],
          ["Implementation support", "Demo, onboarding, configuration, and training content are built into the conversion path."],
          ["Responsible claims", "The site avoids fake ratings, fake clients, unsupported certifications, and hidden SEO shortcuts."],
        ].map(([title, body]) => (
          <article key={title}>
            <ShieldCheck className="h-6 w-6 text-[var(--primary)]" />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SolutionPageContent({ solution }: { solution: Solution }) {
  return (
    <>
      <section className="section">
        <div className="container-shell two-column">
          <div>
            <SectionHeading eyebrow="ERP module" title={solution.title} description={solution.hero} />
            <div className="module-proof-row">
              <span>Bangladesh-ready setup</span>
              <span>Role-based workflow</span>
              <span>Real-time reports</span>
            </div>
            <div className="button-row">
              <ButtonLink href="/demo-request">Request Demo</ButtonLink>
              <ButtonLink href="/solutions" variant="secondary">View All Solutions</ButtonLink>
            </div>
          </div>
          <FeatureList title="Key outcomes" items={solution.outcomes} />
        </div>
      </section>
      <section className="section soft">
        <div className="container-shell">
          <SectionHeading title={`${solution.shortTitle} workflows Bizovix connects`} description="Each module is designed to work with the rest of the business, not as an isolated screen." />
          <div className="card-grid">
            {solution.workflows.map((workflow) => (
              <article className="feature-card" key={workflow}>
                <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
                <h3>{workflow}</h3>
                <p>Keep the operating record current for finance, stock, approval, and reporting teams.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function IndustryPageContent({ industry }: { industry: Industry }) {
  return (
    <>
      <section className="section">
        <div className="container-shell two-column">
          <div>
            <SectionHeading eyebrow="Industry ERP" title={`ERP for ${industry.title}`} description={industry.description} />
            <div className="module-proof-row">
              <span>Local implementation</span>
              <span>Scalable modules</span>
              <span>Management visibility</span>
            </div>
            <div className="button-row">
              <ButtonLink href="/demo-request">Request Demo</ButtonLink>
              <ButtonLink href="/industries" variant="secondary">View All Industries</ButtonLink>
            </div>
          </div>
          <FeatureList title="Operational challenges" items={industry.painPoints} />
        </div>
      </section>
      <section className="section soft">
        <div className="container-shell">
          <SectionHeading title={`${industry.title} use cases`} description="Bizovix content is organized around practical workflows companies can evaluate during a demo." />
          <div className="card-grid">
            {industry.useCases.map((useCase) => (
              <article className="feature-card" key={useCase}>
                <Icon name={industry.icon} className="h-6 w-6 text-[var(--primary)]" />
                <h3>{useCase}</h3>
                <p>Connect teams, approvals, inventory, finance, and reporting around the same source of truth.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="feature-list-panel">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}><CheckCircle2 className="h-5 w-5" />{item}</li>
        ))}
      </ul>
      <Link href="/resources/checklists">Use the ERP readiness checklist <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}
