import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Workflow } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { Icon } from "@/components/ui/Icon";
import { industries } from "@/src/data/industries";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Software by Industry",
  description:
    "Explore Bizovix cloud ERP for manufacturing, garments, pharmaceuticals, food, wholesale, retail POS, logistics, construction, e-commerce, and service businesses in Bangladesh.",
  path: "/industries",
});

const industryGroups = industries.reduce<Record<string, typeof industries>>((groups, industry) => {
  groups[industry.group] ||= [];
  groups[industry.group].push(industry);
  return groups;
}, {});

const stats = [
  { value: "10+", label: "Industry playbooks" },
  { value: "8", label: "Core ERP modules" },
  { value: "BD-ready", label: "Local workflows" },
  { value: "Cloud", label: "Multi-branch access" },
];

export default function IndustriesPage() {
  return (
    <>
      <section className="erp-page-hero erp-page-hero--industries">
        <div className="container-shell erp-page-hero-grid">
          <div className="erp-page-hero-copy">
            <span className="biz-page-badge">
              <MapPin size={14} /> ERP for Bangladesh industries
            </span>
            <h1>Industry-focused cloud ERP for connected business operations</h1>
            <p>
              Bizovix maps real operating workflows for production, distribution, retail, project, and service teams so every
              department can work from one accurate ERP platform.
            </p>
            <div className="erp-hero-actions">
              <Link href="/demo-request" className="erp-primary-link">
                Plan an ERP demo <ArrowRight size={16} />
              </Link>
              <Link href="/solutions" className="erp-secondary-link">
                Explore modules
              </Link>
            </div>
          </div>
          <div className="erp-hero-panel">
            <div className="erp-hero-panel-head">
              <ShieldCheck size={20} />
              <span>Built for industry adoption</span>
            </div>
            {stats.map((item) => (
              <div className="erp-hero-stat" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="erp-directory-section">
        <div className="container-shell">
          <div className="erp-section-head">
            <span className="biz-page-badge">
              <Workflow size={14} /> Industry coverage
            </span>
            <h2>Choose the business model closest to your operation</h2>
            <p>
              Each page explains practical pain points, ERP use cases, and connected Bizovix modules for companies planning a
              more reliable cloud ERP rollout.
            </p>
          </div>

          <div className="erp-group-rail">
            {Object.keys(industryGroups).map((group) => (
              <span key={group}>{group}</span>
            ))}
          </div>

          <div className="erp-directory-grid">
            {industries.map((industry) => (
              <Link href={`/industries/${industry.slug}`} className="erp-directory-card" key={industry.slug}>
                <span className="erp-card-icon">
                  <Icon name={industry.icon} />
                </span>
                <span className="erp-card-group">{industry.group}</span>
                <h3>{industry.title} ERP</h3>
                <p>{industry.description}</p>
                <ul>
                  {industry.useCases.slice(0, 2).map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={15} /> {item}
                    </li>
                  ))}
                </ul>
                <span className="erp-card-link">
                  View industry workflow <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="erp-fit-section">
        <div className="container-shell erp-fit-card">
          <div>
            <span className="biz-page-badge">Implementation-ready ERP</span>
            <h2>Designed around local operations, not generic software screens</h2>
            <p>
              Bizovix helps Bangladeshi teams connect procurement, inventory, production, sales, accounting, HR, payroll, and
              reporting with permissions, approvals, and dashboards that fit daily business decisions.
            </p>
          </div>
          <div className="erp-fit-list">
            {["Department-wise rollout", "Multi-branch data visibility", "Audit-ready approvals", "Management dashboards"].map((item) => (
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
