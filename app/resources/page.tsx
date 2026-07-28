import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, FileText, Layers3, Newspaper, SearchCheck } from "lucide-react";
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

  return (
    <>
      <section className="contact-page-hero resources-reference-hero">
        <div className="container-shell contact-page-hero-inner">
          <p>Resources</p>
          <h1>ERP resources for smarter planning</h1>
        </div>
      </section>

      <section className="reference-main-section" id="resource-library">
        <div className="container-shell reference-main-card resources-reference-card">
          <div className="reference-main-info">
            <p className="contact-kicker">Bizovix knowledge hub</p>
            <h2>
              Use practical ERP guides, checklists, and update notes to prepare{" "}
              <span className="title-accent">better decisions</span>.
            </h2>
            <p>
              These resources help business owners, finance teams, operations leaders, manufacturers,
              distributors, retailers, and implementation teams understand ERP scope, data readiness,
              approvals, reporting needs, and rollout planning.
            </p>
            <div className="reference-featured-resource">
              <span><BookOpen className="h-5 w-5" />Featured guide</span>
              <h3>{featured.title}</h3>
              <p>{featured.summary}</p>
              <Link href={`/resources/${featured.slug}`}>
                Open featured resource <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="reference-blue-panel resources-blue-panel">
            <p className="reference-panel-title">Explore ERP planning content built around real business operations and implementation readiness.</p>
            <div className="resources-reference-list">
              {resources.map((resource) => {
                const Icon = resourceIcons[resource.category];
                return (
                  <Link href={`/resources/${resource.slug}`} key={resource.slug}>
                    <Icon className="h-5 w-5" />
                    <span>
                      <strong>{resource.title}</strong>
                      <small>{resource.category} | {resource.readingTime}</small>
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="reference-support-section">
        <div className="container-shell resource-process-grid">
          <div>
            <p className="biz-page-badge"><SearchCheck className="h-4 w-4" />ERP Planning Path</p>
            <h2>
              Turn research into a practical{" "}
              <span className="title-accent">implementation conversation</span>
            </h2>
            <p>
              The best ERP evaluation starts with workflow clarity: what needs control,
              what data must migrate, who approves what, and which reports leadership needs.
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
            <h2>
              Explore ERP topics by{" "}
              <span className="title-accent">business priority</span>
            </h2>
          </div>
          <div className="resource-topic-grid">
            {["Accounting", "Inventory", "Manufacturing", "Purchase", "Sales and POS", "HR Payroll", "Approvals", "Dashboards"].map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Use these resources before installing Bizovix ERP" />
    </>
  );
}
