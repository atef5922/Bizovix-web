import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Download, Layers3, Route, ShieldCheck } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { DownloadLink } from "@/components/ui/Button";
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
  construction: {
    src: "/videos/bizovix-project-service-preview.mp4",
    label: "Project cost preview",
    focus: "site purchases, material control, vendor payments, approvals, and project cost visibility",
  },
};

const industryDetailContent: Record<
  string,
  {
    badge: string;
    intro: string;
    priorityTitle: string;
    priorities: string[];
    rolloutTitle: string;
    rollout: string[];
    outcomeTitle: string;
    outcomes: string[];
  }
> = {
  manufacturing: {
    badge: "Factory workflow control",
    intro:
      "Manufacturing ERP should make the production cycle visible from material planning to finished goods. Bizovix connects production, stock, purchase, accounts, and reports so factory teams can reduce manual follow-up.",
    priorityTitle: "Production gaps Bizovix helps control",
    priorities: ["Material demand and raw stock planning", "Work order progress and production accountability", "Costing visibility between purchase, inventory, and output"],
    rolloutTitle: "Recommended manufacturing rollout",
    rollout: ["Map BOM and stock issue rules", "Configure work order stages", "Connect purchase and inventory records", "Review production and costing reports"],
    outcomeTitle: "What management can review",
    outcomes: ["Planned vs completed production", "Raw material usage", "Finished-goods movement", "Production cost context"],
  },
  "garments-textile": {
    badge: "Garments order visibility",
    intro:
      "Garments and textile teams need order, material, line, payroll, and shipment context to stay connected. Bizovix helps reduce blind spots between merchandising, production, warehouse, and management teams.",
    priorityTitle: "Garments operation gaps Bizovix helps control",
    priorities: ["Fabric, trims, and warehouse movement", "Line-wise production updates and delivery readiness", "Order costing with payroll and stock context"],
    rolloutTitle: "Recommended garments rollout",
    rollout: ["Structure order and material records", "Configure production and line updates", "Connect sales, inventory, and payroll context", "Review shipment and costing visibility"],
    outcomeTitle: "What management can review",
    outcomes: ["Fabric utilization", "Line progress", "Order delivery status", "Cost and payroll context"],
  },
  pharmaceuticals: {
    badge: "Batch-aware ERP control",
    intro:
      "Pharmaceutical operations require disciplined stock handling, batch visibility, approved purchasing, and warehouse reporting. Bizovix keeps batch, inventory, purchase, production, and finance records easier to verify.",
    priorityTitle: "Pharma operation gaps Bizovix helps control",
    priorities: ["Batch movement and stock discipline", "Approval-heavy purchase workflows", "Warehouse, production, and finance reporting alignment"],
    rolloutTitle: "Recommended pharma rollout",
    rollout: ["Define batch and warehouse rules", "Configure purchase approvals", "Connect production and stock movement", "Review operational reports"],
    outcomeTitle: "What management can review",
    outcomes: ["Batch stock status", "Approved purchases", "Warehouse movement", "Production and finance summaries"],
  },
  "wholesale-distribution": {
    badge: "Distribution visibility",
    intro:
      "Distribution teams need branch stock, customer credit, purchase flow, sales order allocation, and delivery readiness in one place. Bizovix connects the distribution cycle from purchase to collection.",
    priorityTitle: "Distribution gaps Bizovix helps control",
    priorities: ["Multi-warehouse stock mismatch", "Customer credit and account statement visibility", "Order allocation, delivery readiness, and collection follow-up"],
    rolloutTitle: "Recommended distribution rollout",
    rollout: ["Map branches and warehouses", "Configure sales and purchase workflows", "Connect customer and vendor accounts", "Review stock, order, and collection reports"],
    outcomeTitle: "What management can review",
    outcomes: ["Branch stock status", "Open sales orders", "Customer credit", "Purchase and delivery movement"],
  },
  "retail-pos": {
    badge: "Store and POS control",
    intro:
      "Retail teams need fast checkout while stock, cash, returns, discounts, and customer records stay connected. Bizovix POS supports store teams and gives owners better daily visibility.",
    priorityTitle: "Retail operation gaps Bizovix helps control",
    priorities: ["Counter sales and receipt speed", "Real-time stock updates after sales and returns", "Daily cash, payment method, and customer history visibility"],
    rolloutTitle: "Recommended retail rollout",
    rollout: ["Prepare product and price records", "Configure POS users and payment methods", "Connect inventory and accounting", "Review daily sales and stock reports"],
    outcomeTitle: "What management can review",
    outcomes: ["Daily sales", "Cash summaries", "Stock movement", "Customer purchase history"],
  },
  construction: {
    badge: "Project and site control",
    intro:
      "Construction teams need site-wise material control, project purchase approval, vendor payments, and cost visibility. Bizovix helps connect site activity with purchase, inventory, accounting, and management reporting.",
    priorityTitle: "Construction gaps Bizovix helps control",
    priorities: ["Site material leakage and manual stock records", "Project purchase approvals and vendor payable tracking", "Project cost visibility across site, purchase, and accounting"],
    rolloutTitle: "Recommended construction rollout",
    rollout: ["Map projects, sites, and warehouses", "Configure purchase approval rules", "Connect inventory issue and vendor bills", "Review project cost and payable reports"],
    outcomeTitle: "What management can review",
    outcomes: ["Site stock balance", "Approved purchases", "Vendor payables", "Project cost movement"],
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
  const video = industryVideoMap[industry.slug] ?? industryVideoMap.manufacturing;
  const detail = industryDetailContent[industry.slug] ?? industryDetailContent.manufacturing;

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
            <p>{detail.intro}</p>
            <div className="erp-detail-hero-actions">
              <DownloadLink className="erp-primary-link">
                Download ERP software <Download size={16} />
              </DownloadLink>
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
        <div className="container-shell industry-detail-workspace">
          <div className="industry-detail-heading">
            <span className="biz-page-badge">
              <ShieldCheck size={14} /> {detail.badge}
            </span>
            <h2>{detail.priorityTitle}</h2>
            <p>
              Bizovix industry pages focus on operational decisions, not broad category pages. The goal is to show what
              needs to be controlled first and which ERP modules should connect around that workflow.
            </p>
          </div>

          <div className="industry-detail-grid">
            <article className="industry-detail-card industry-detail-card--priorities">
              <span className="industry-detail-card-label">Operating priorities</span>
              <div className="industry-detail-priority-list">
                {detail.priorities.map((item, index) => (
                  <div key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="industry-detail-card">
              <span className="industry-detail-card-label">Practical use cases</span>
              <div className="industry-detail-usecase-list">
                {industry.useCases.map((item) => (
                  <span key={item}>
                    <ClipboardCheck size={15} /> {item}
                  </span>
                ))}
              </div>
            </article>
          </div>

          <div className="industry-stack-card">
            <div className="industry-stack-copy">
              <span className="biz-page-badge">
                <Layers3 size={14} /> Recommended ERP stack
              </span>
              <h2>Modules that make {industry.title.toLowerCase()} operations work together</h2>
              <p>
                These modules are selected because they support the daily records behind {industry.title.toLowerCase()}:
                approvals, stock, costing, billing, customer or vendor accounts, and management reporting.
              </p>
            </div>
            <div className="industry-stack-links">
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
          </div>

          <div className="industry-rollout-flow">
            <div>
              <span className="biz-page-badge">
                <Route size={14} /> Rollout priorities
              </span>
              <h2>{detail.rolloutTitle}</h2>
            </div>
            <div className="industry-rollout-flow-list">
              {detail.rollout.map((item, index) => (
                <article key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="industry-outcome-card">
            <div>
              <span className="biz-page-badge">
                <CheckCircle2 size={14} /> Management outcomes
              </span>
              <h2>{detail.outcomeTitle}</h2>
            </div>
            <div className="industry-outcome-list">
              {detail.outcomes.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection title={`Download Bizovix ERP software for ${industry.title}`} />
    </>
  );
}
