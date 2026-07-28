import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, Layers3, ShieldCheck, Workflow } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/src/config/site";
import { solutions } from "@/src/data/solutions";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cloud ERP Solutions",
  description:
    "Explore Bizovix ERP modules for accounting, purchase, inventory, manufacturing, sales, POS, HR, payroll, clients, vendors, approvals, and reporting.",
  path: "/solutions",
});

const solutionGroups = solutions.reduce<Record<string, typeof solutions>>((groups, solution) => {
  groups[solution.group] ||= [];
  groups[solution.group].push(solution);
  return groups;
}, {});

const operatingCycle = ["Accounting", "Purchase", "Inventory", "Manufacturing", "Sales", "POS", "HR", "Reports"];

export default function SolutionsPage() {
  return (
    <>
      <section className="erp-page-hero erp-page-hero--solutions">
        <div className="container-shell erp-page-hero-grid">
          <div className="erp-page-hero-copy">
            <span className="biz-page-badge">
              <Layers3 size={14} /> Connected ERP solutions
            </span>
            <h1>
              Cloud ERP modules that connect{" "}
              <span className="title-accent">every operating team</span>
            </h1>
            <p>
              Start with the workflows your company needs today and expand Bizovix into a complete ERP platform for finance,
              purchase, inventory, manufacturing, sales, POS, HR, payroll, and reporting.
            </p>
            <div className="erp-hero-actions">
              <a href={siteConfig.erpDownloadPath} download={siteConfig.erpDownloadFileName} className="erp-primary-link">
                Download ERP software <Download size={16} />
              </a>
              <Link href="/industries" className="erp-secondary-link">
                View industries
              </Link>
            </div>
          </div>
          <div className="erp-hero-panel erp-cycle-panel">
            <div className="erp-hero-panel-head">
              <ShieldCheck size={20} />
              <span>One connected operating cycle</span>
            </div>
            <div className="erp-cycle-grid">
              {operatingCycle.map((item, index) => (
                <span key={item}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="erp-directory-section">
        <div className="container-shell">
          <div className="erp-section-head">
            <span className="biz-page-badge">
              <Workflow size={14} /> ERP module library
            </span>
            <h2>
              Explore the <span className="title-accent">workflows</span> Bizovix connects
            </h2>
            <p>
              Every solution page explains expected outcomes, daily workflows, and management metrics so teams can plan the
              right ERP scope before implementation starts.
            </p>
          </div>

          <div className="erp-group-rail">
            {Object.keys(solutionGroups).map((group) => (
              <span key={group}>{group}</span>
            ))}
          </div>

          <div className="erp-directory-grid">
            {solutions.map((solution) => (
              <Link href={`/solutions/${solution.slug}`} className="erp-directory-card" key={solution.slug}>
                <span className="erp-card-icon">
                  <Icon name={solution.icon} />
                </span>
                <span className="erp-card-group">{solution.group}</span>
                <h3>{solution.shortTitle}</h3>
                <p>{solution.description}</p>
                <ul>
                  {solution.outcomes.slice(0, 2).map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={15} /> {item}
                    </li>
                  ))}
                </ul>
                <span className="erp-card-link">
                  View solution details <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="erp-fit-section">
        <div className="container-shell erp-fit-card erp-fit-card--dark">
          <div>
            <span className="biz-page-badge">Scalable ERP architecture</span>
            <h2>Deploy one module first or connect the full business stack</h2>
            <p>
              Bizovix keeps module data connected, so teams can move from spreadsheets and disconnected tools to structured
              approvals, live inventory, finance visibility, and leadership dashboards.
            </p>
          </div>
          <div className="erp-fit-list">
            {["Role-based access", "Cloud sync", "Audit trail", "Cross-module reports"].map((item) => (
              <span key={item}>
                <CheckCircle2 size={16} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Build the right ERP module plan for your business" />
    </>
  );
}
