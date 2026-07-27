import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, FileText, Layers3, Newspaper, Rocket, SearchCheck } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { resources } from "@/src/data/resources";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Resources",
  description: "Explore Bizovix ERP resources, guides, checklists, implementation planning articles, case-style scenarios, and product update notes for growing companies.",
  path: "/resources",
});

const resourceIcons = {
  "ERP Guides": BookOpen,
  "Case Studies": FileText,
  "Checklists": ClipboardCheck,
  "Product Updates": Newspaper,
};

const planningSteps = [
  "Identify workflows and departments",
  "Prepare users, branches, and data",
  "Compare modules and reporting needs",
  "Plan implementation and training",
];

export default function ResourcesPage() {
  const featured = resources[0];
  const otherResources = resources.slice(1);

  return (
    <>
      <section className="biz-page-hero resources-hero">
        <div className="container-shell biz-page-hero-grid">
          <div className="biz-page-hero-copy">
            <p className="biz-page-badge"><BookOpen className="h-4 w-4" />Bizovix Resources</p>
            <h1>ERP knowledge built for better business decisions</h1>
            <p>
              Use Bizovix ERP guides, readiness checklists, product notes, and planning resources
              to prepare your team for a clearer cloud ERP evaluation and rollout.
            </p>
            <div className="biz-hero-actions">
              <a href="#resource-library">Explore resources <ArrowRight className="h-4 w-4" /></a>
              <Link href="/blog">Read ERP blog</Link>
            </div>
          </div>
          <div className="resources-hero-panel">
            {planningSteps.map((item, index) => (
              <span key={item}><strong>{String(index + 1).padStart(2, "0")}</strong>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="biz-section compact" id="resource-library">
        <div className="container-shell resources-layout">
          <article className="resource-spotlight-card">
            <p className="biz-page-badge"><Rocket className="h-4 w-4" />Featured Guide</p>
            <h2>{featured.title}</h2>
            <p>{featured.summary}</p>
            <div className="resource-meta-row">
              <span>{featured.category}</span>
              <span>{featured.readingTime}</span>
            </div>
            <Link href={`/resources/${featured.slug}`}>
              Open featured resource <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <div className="resources-card-column">
            {otherResources.map((resource) => {
              const Icon = resourceIcons[resource.category];
              return (
                <article className="resource-library-card" key={resource.slug}>
                  <span><Icon className="h-5 w-5" /></span>
                  <div>
                    <p>{resource.category} | {resource.readingTime}</p>
                    <h3><Link href={`/resources/${resource.slug}`}>{resource.title}</Link></h3>
                    <small>{resource.summary}</small>
                    <Link href={`/resources/${resource.slug}`}>Read resource <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="biz-section resource-process-section">
        <div className="container-shell resource-process-grid">
          <div>
            <p className="biz-page-badge"><SearchCheck className="h-4 w-4" />ERP Planning Path</p>
            <h2>Turn research into a practical implementation conversation</h2>
            <p>
              The best ERP evaluation starts with real operating questions: which workflows need control,
              what data must migrate, who approves what, and which reports leadership needs every week.
            </p>
          </div>
          <div className="resource-check-list">
            {planningSteps.map((item) => (
              <span key={item}><CheckCircle2 className="h-4 w-4" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="biz-section compact">
        <div className="container-shell">
          <div className="biz-section-heading">
            <p className="biz-page-badge"><Layers3 className="h-4 w-4" />Resource Topics</p>
            <h2>Explore ERP topics by business priority</h2>
          </div>
          <div className="resource-topic-grid">
            {["Accounting", "Inventory", "Manufacturing", "Purchase", "Sales and POS", "HR Payroll", "Approvals", "Dashboards"].map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Use these resources in a focused Bizovix ERP demo" />
    </>
  );
}
