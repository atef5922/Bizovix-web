import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, MapPin, ShieldCheck, Workflow } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { Icon } from "@/components/ui/Icon";
import { industries } from "@/src/data/industries";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Industry ERP Software in Bangladesh",
  description:
    "Explore focused Bizovix ERP industry solutions for manufacturing, garments, pharmaceuticals, wholesale distribution, retail POS, and construction businesses in Bangladesh.",
  path: "/industries",
});

const industryGroups = industries.reduce<Record<string, typeof industries>>((groups, industry) => {
  groups[industry.group] ||= [];
  groups[industry.group].push(industry);
  return groups;
}, {});

const industryStats = [
  { value: "6", label: "Focused industry paths" },
  { value: "8", label: "Connected ERP modules" },
  { value: "BD", label: "Local operation fit" },
  { value: "Cloud", label: "Branch-ready access" },
];

const adoptionPoints = [
  "Start with the highest-impact workflow instead of launching every module at once.",
  "Connect stock, approval, finance, sales, and reporting records around the real operating cycle.",
  "Keep implementation practical for Bangladeshi teams, branches, warehouses, and management users.",
];

export default function IndustriesPage() {
  return (
    <>
      <section className="erp-page-hero erp-page-hero--industries industry-index-hero">
        <div className="container-shell erp-page-hero-grid">
          <div className="erp-page-hero-copy">
            <span className="biz-page-badge">
              <MapPin size={14} /> Industry ERP for Bangladesh
            </span>
            <h1>Focused ERP playbooks for the industries that need Bizovix most</h1>
            <p>
              Bizovix is organized around practical business models: factories, garments operations, pharma warehouses,
              distribution networks, retail stores, and project sites. Each path connects the ERP modules that matter most.
            </p>
            <div className="erp-hero-actions">
              <Link href="/demo-request" className="erp-primary-link">
                Plan industry demo <ArrowRight size={16} />
              </Link>
              <Link href="/solutions" className="erp-secondary-link">
                View ERP modules
              </Link>
            </div>
          </div>

          <div className="industry-index-panel">
            <div className="industry-index-panel-head">
              <ShieldCheck size={20} />
              <span>Priority industries</span>
            </div>
            <div className="industry-index-stat-grid">
              {industryStats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="industry-index-panel-list">
              {Object.keys(industryGroups).map((group) => (
                <span key={group}>{group}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="industry-index-section">
        <div className="container-shell">
          <div className="erp-section-head industry-index-heading">
            <span className="biz-page-badge">
              <Workflow size={14} /> Focused coverage
            </span>
            <h2>Choose the closest operating model</h2>
            <p>
              The industry menu now focuses on the most relevant ERP use cases for Bizovix customers. Each page explains the
              operational gaps, connected modules, and rollout priorities for that business model.
            </p>
          </div>

          <div className="industry-index-grid">
            {industries.map((industry, index) => (
              <Link href={`/industries/${industry.slug}`} className="industry-index-card" key={industry.slug}>
                <span className="industry-index-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="erp-card-icon">
                  <Icon name={industry.icon} />
                </span>
                <span className="erp-card-group">{industry.group}</span>
                <h3>{industry.title} ERP</h3>
                <p>{industry.description}</p>
                <div className="industry-index-usecases">
                  {industry.useCases.slice(0, 2).map((item) => (
                    <span key={item}>
                      <CheckCircle2 size={14} /> {item}
                    </span>
                  ))}
                </div>
                <span className="erp-card-link">
                  View industry page <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="industry-rollout-section">
        <div className="container-shell industry-rollout-card">
          <div>
            <span className="biz-page-badge">
              <Layers3 size={14} /> Implementation logic
            </span>
            <h2>Industry pages are built around adoption, not generic category lists</h2>
            <p>
              Bizovix helps teams identify the operating workflows that should go live first, then connects surrounding ERP
              modules as users, branches, and reporting needs mature.
            </p>
          </div>
          <div className="industry-rollout-list">
            {adoptionPoints.map((item) => (
              <span key={item}>
                <CheckCircle2 size={16} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Find the right Bizovix ERP path for your industry" />
    </>
  );
}
