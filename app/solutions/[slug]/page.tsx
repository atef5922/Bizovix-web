import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, CheckCircle2, Layers3, Route } from "lucide-react";
import { DashboardShowcase } from "@/components/product/DashboardShowcase";
import { CTASection } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/src/config/site";
import { industries } from "@/src/data/industries";
import { getSolution, solutions } from "@/src/data/solutions";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";
import { absoluteUrl } from "@/src/lib/utils";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};
  return pageMetadata({
    title: `${solution.title} Software`,
    description: `${solution.hero} Learn outcomes, workflows, metrics, and implementation use cases for Bizovix ${solution.shortTitle} ERP.`,
    path: `/solutions/${solution.slug}`,
  });
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  const crumbs = [
    { title: "Home", href: "/" },
    { title: "Solutions", href: "/solutions" },
    { title: solution.shortTitle, href: `/solutions/${solution.slug}` },
  ];

  const relatedIndustries = industries
    .filter((industry) => industry.connectedSolutions.includes(solution.shortTitle) || industry.connectedSolutions.includes(solution.shortTitle.replace(" (POS)", "")))
    .slice(0, 4);

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Bizovix ${solution.title}`,
    description: solution.hero,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    areaServed: ["Bangladesh", "South Asia"],
    url: absoluteUrl(`/solutions/${solution.slug}`),
  };

  return (
    <>
      <SEOJsonLd data={breadcrumbJsonLd(crumbs.map((item) => ({ name: item.title, href: item.href })))} />
      <SEOJsonLd data={softwareJsonLd} />

      <section className="erp-detail-hero erp-detail-hero--solution">
        <div className="container-shell erp-detail-hero-grid">
          <div className="erp-detail-copy">
            <div className="erp-detail-topline">
              <Link href="/solutions">
                <ArrowLeft size={16} /> Back to solutions
              </Link>
              <span>{solution.group}</span>
            </div>
            <span className="biz-page-badge">
              <Icon name={solution.icon} /> Bizovix solution
            </span>
            <h1>{solution.title} for growing business teams</h1>
            <p>{solution.hero}</p>
          </div>

          <div className="erp-detail-panel">
            <div className="erp-detail-panel-head">
              <BarChart3 size={20} />
              <span>Management metrics</span>
            </div>
            <div className="erp-metric-grid">
              {solution.metrics.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="erp-detail-section">
        <div className="container-shell erp-detail-layout">
          <article className="erp-detail-card erp-detail-card--wide">
            <span className="biz-page-badge">
              <CheckCircle2 size={14} /> Business outcomes
            </span>
            <h2>What teams can control with {solution.shortTitle}</h2>
            <p>
              Bizovix keeps this module connected to surrounding departments so data is captured once, reviewed with clear
              responsibility, and reflected in real-time business reports.
            </p>
            <div className="erp-proof-grid">
              {solution.outcomes.map((item, index) => (
                <div className="erp-proof-card" key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item}</h3>
                  <p>
                    Improve daily accountability with structured records, permissions, approvals, and reliable reporting.
                  </p>
                </div>
              ))}
            </div>
          </article>

          <aside className="erp-detail-card">
            <span className="biz-page-badge">
              <Route size={14} /> Workflow path
            </span>
            <h2>Connected process flow</h2>
            <div className="erp-timeline-list">
              {solution.workflows.map((item, index) => (
                <div key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="erp-showcase-section">
        <div className="container-shell erp-showcase-grid">
          <div className="erp-showcase-copy">
            <span className="biz-page-badge">
              <Layers3 size={14} /> Connected ERP workspace
            </span>
            <h2>One module, connected to the full operating platform</h2>
            <p>
              Use Bizovix to connect {solution.shortTitle.toLowerCase()} with finance, inventory, approval flows, branch data,
              and leadership dashboards across Bangladesh and South Asia.
            </p>
            <div className="erp-related-grid">
              {relatedIndustries.map((industry) => (
                <Link href={`/industries/${industry.slug}`} key={industry.slug}>
                  <Icon name={industry.icon} />
                  <span>{industry.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <DashboardShowcase compact />
        </div>
      </section>

      <section className="erp-roadmap-section">
        <div className="container-shell erp-roadmap-card">
          <div>
            <span className="biz-page-badge">Implementation-ready</span>
            <h2>Deploy {solution.shortTitle} with clean roles and practical training</h2>
          </div>
          <div className="erp-roadmap-steps">
            {["Define module scope", "Configure approval rules", "Migrate key records", "Train daily users"].map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection title={`See how ${solution.shortTitle} fits your operation`} />
    </>
  );
}
