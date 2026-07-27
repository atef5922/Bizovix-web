import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardCheck, Layers3, Workflow } from "lucide-react";
import { DashboardShowcase } from "@/components/product/DashboardShowcase";
import { CTASection } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { AutoPlayVideo } from "@/components/ui/AutoPlayVideo";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/src/config/site";
import { getIndustry, industries } from "@/src/data/industries";
import { solutions } from "@/src/data/solutions";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";
import { absoluteUrl } from "@/src/lib/utils";

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

const industryVideoMap: Record<string, { src: string; label: string; focus: string }> = {
  manufacturing: {
    src: "/videos/bizovix-production-preview.mp4",
    label: "Production workflow preview",
    focus: "work orders, material movement, costing, and production reporting",
  },
  "garments-textile": {
    src: "/videos/bizovix-production-preview.mp4",
    label: "Garments production preview",
    focus: "fabric, trims, line progress, quality, and shipment readiness",
  },
  pharmaceuticals: {
    src: "/videos/bizovix-inventory-batch-preview.mp4",
    label: "Batch and inventory preview",
    focus: "batch stock, approved purchases, warehouse control, and reporting",
  },
  "food-beverage": {
    src: "/videos/bizovix-inventory-batch-preview.mp4",
    label: "Recipe and stock preview",
    focus: "ingredients, recipes, stock movement, shelf-life awareness, and sales",
  },
  "wholesale-distribution": {
    src: "/videos/bizovix-distribution-preview.mp4",
    label: "Distribution operations preview",
    focus: "purchase, multi-warehouse stock, sales orders, credit, and delivery planning",
  },
  "retail-pos": {
    src: "/videos/bizovix-retail-pos-preview.mp4",
    label: "Retail POS preview",
    focus: "counter sales, connected inventory, returns, discounts, and daily cash control",
  },
  ecommerce: {
    src: "/videos/bizovix-retail-pos-preview.mp4",
    label: "Online order preview",
    focus: "online orders, stock reservation, fulfillment, customer history, and reports",
  },
  "logistics-supply-chain": {
    src: "/videos/bizovix-distribution-preview.mp4",
    label: "Supply chain preview",
    focus: "branch transfers, vendor activity, delivery readiness, and operational reporting",
  },
  construction: {
    src: "/videos/bizovix-project-service-preview.mp4",
    label: "Project cost preview",
    focus: "site purchases, material control, vendor payments, approvals, and project cost visibility",
  },
  "service-businesses": {
    src: "/videos/bizovix-project-service-preview.mp4",
    label: "Service operation preview",
    focus: "client records, invoicing, expenses, payroll, approvals, and team visibility",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return pageMetadata({
    title: `${industry.title} ERP Software`,
    description: `${industry.description} Explore Bizovix cloud ERP workflows, modules, and implementation focus for ${industry.title.toLowerCase()} businesses in Bangladesh.`,
    path: `/industries/${industry.slug}`,
  });
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const crumbs = [
    { title: "Home", href: "/" },
    { title: "Industries", href: "/industries" },
    { title: industry.title, href: `/industries/${industry.slug}` },
  ];

  const connected = industry.connectedSolutions
    .map((title) => solutions.find((solution) => solution.shortTitle === title || solution.title.startsWith(title)))
    .filter(Boolean);
  const video = industryVideoMap[industry.slug];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Bizovix ${industry.title} ERP software`,
    description: industry.description,
    serviceType: `Cloud ERP software for ${industry.title}`,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    areaServed: ["Bangladesh", "South Asia"],
    url: absoluteUrl(`/industries/${industry.slug}`),
  };

  return (
    <>
      <SEOJsonLd data={breadcrumbJsonLd(crumbs.map((item) => ({ name: item.title, href: item.href })))} />
      <SEOJsonLd data={serviceJsonLd} />

      <section className="erp-detail-hero">
        <div className="container-shell erp-detail-hero-grid erp-detail-hero-grid--with-video">
          <div className="erp-detail-copy">
            <div className="erp-detail-topline">
              <Link href="/industries">
                <ArrowLeft size={16} /> Back to industries
              </Link>
              <span>{industry.group}</span>
            </div>
            <span className="biz-page-badge">
              <Icon name={industry.icon} /> Industry ERP
            </span>
            <h1>{industry.title} ERP software for connected operations</h1>
            <p>
              {industry.description} Bizovix gives {industry.title.toLowerCase()} teams a practical way to connect data,
              approvals, stock, finance, and management reporting without scattered files.
            </p>
            <div className="erp-detail-hero-actions">
              <Link href="/demo-request" className="erp-primary-link">
                Request demo <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="erp-secondary-link">
                View pricing
              </Link>
            </div>
          </div>

          <div className="erp-hero-video-shell">
            <div className="erp-video-frame-wrap">
              <AutoPlayVideo
                src={video.src}
                label={`${industry.title} Bizovix ERP auto-playing software preview`}
                className="erp-hero-video"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="erp-detail-section">
        <div className="container-shell erp-detail-layout">
          <article className="erp-detail-card erp-detail-card--wide">
            <span className="biz-page-badge">
              <ClipboardCheck size={14} /> Practical use cases
            </span>
            <h2>What Bizovix improves for {industry.title.toLowerCase()} teams</h2>
            <p>
              This ERP setup is designed to reduce manual coordination, improve department accountability, and give managers
              a clearer view of the operating cycle from request to report.
            </p>
            <div className="erp-proof-grid">
              {industry.useCases.map((item, index) => (
                <div className="erp-proof-card" key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item}</h3>
                  <p>
                    Keep this workflow connected with approvals, inventory, accounting, and reporting so daily decisions are
                    easier to verify.
                  </p>
                </div>
              ))}
            </div>
          </article>

          <aside className="erp-detail-card">
            <span className="biz-page-badge">
              <Layers3 size={14} /> Connected modules
            </span>
            <h2>Recommended ERP stack</h2>
            <div className="erp-module-list">
              {connected.map((solution) =>
                solution ? (
                  <Link href={`/solutions/${solution.slug}`} key={solution.slug}>
                    <Icon name={solution.icon} />
                    <span>{solution.shortTitle}</span>
                    <ArrowRight size={15} />
                  </Link>
                ) : null,
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="erp-showcase-section">
        <div className="container-shell erp-showcase-grid">
          <div className="erp-showcase-copy">
            <span className="biz-page-badge">
              <Workflow size={14} /> Live visibility
            </span>
            <h2>Dashboards built for department heads and leadership teams</h2>
            <p>
              Track operating status, pending approvals, branch stock, sales performance, production movement, and financial
              summaries from one connected Bizovix ERP workspace.
            </p>
          </div>
          <DashboardShowcase compact />
        </div>
      </section>

      <section className="erp-roadmap-section">
        <div className="container-shell erp-roadmap-card">
          <div>
            <span className="biz-page-badge">ERP rollout path</span>
            <h2>From process mapping to confident adoption</h2>
          </div>
          <div className="erp-roadmap-steps">
            {["Map current workflow", "Configure modules", "Train users", "Review dashboards"].map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection title={`Plan a Bizovix ERP demo for ${industry.title}`} />
    </>
  );
}
