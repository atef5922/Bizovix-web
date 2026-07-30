import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, Layers3, Route, Workflow } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { AutoPlayVideo } from "@/components/ui/AutoPlayVideo";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/src/config/site";
import { industries } from "@/src/data/industries";
import { getSolution, solutions } from "@/src/data/solutions";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";
import { absoluteUrl } from "@/src/lib/utils";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

const solutionVideoMap: Record<string, { src: string; label: string }> = {
  accounting: {
    src: "/videos/bizovix-project-service-preview.mp4",
    label: "Accounting and finance ERP preview",
  },
  purchase: {
    src: "/videos/bizovix-distribution-preview.mp4",
    label: "Purchase management ERP preview",
  },
  inventory: {
    src: "/videos/bizovix-inventory-batch-preview.mp4",
    label: "Inventory management ERP preview",
  },
  manufacturing: {
    src: "/videos/bizovix-production-preview.mp4",
    label: "Manufacturing ERP preview",
  },
  sales: {
    src: "/videos/bizovix-distribution-preview.mp4",
    label: "Sales ERP preview",
  },
  "point-of-sale": {
    src: "/videos/bizovix-retail-pos-preview.mp4",
    label: "Point of Sale ERP preview",
  },
  "hr-payroll": {
    src: "/videos/bizovix-project-service-preview.mp4",
    label: "HR and Payroll ERP preview",
  },
  "client-vendor": {
    src: "/videos/bizovix-project-service-preview.mp4",
    label: "Client and vendor ERP preview",
  },
};

const solutionVisualMap: Record<string, string> = {
  accounting: "/images/solutions/Accounting%20module.webp",
  purchase: "/images/solutions/Purchase%20module.webp",
  inventory: "/images/solutions/Inventory%20module.webp",
  manufacturing: "/images/solutions/Manufacturing%20module.webp",
  sales: "/images/solutions/Sales%20module.webp",
  "point-of-sale": "/images/solutions/POS%20module.webp",
  "hr-payroll": "/images/solutions/HR%20and%20payroll%20module.webp",
  "client-vendor": "/images/solutions/Relationship%20module.webp",
};

const solutionPlaybooks: Record<
  string,
  {
    theme: "blue" | "cyan" | "emerald" | "indigo";
    reverse?: boolean;
    eyebrow: string;
    title: string;
    summary: string;
    reasons: string[];
    manageTitle: string;
    manageIntro: string;
    proofTitle: string;
    faqs: Array<{ question: string; answer: string }>;
  }
> = {
  accounting: {
    theme: "blue",
    eyebrow: "Accounting module",
    title: "Why businesses use the Bizovix Accounting module",
    summary:
      "A connected accounting module helps finance teams keep journals, income, expenses, receivables, payables, and reports aligned with daily operations instead of chasing scattered files.",
    reasons: [
      "Reduce manual accounting work and duplicate data entry",
      "Maintain organized financial records across sales and purchases",
      "Monitor cash flow, receivables, and payables with clearer context",
      "Connect accounting with inventory, purchase, sales, and approvals",
    ],
    manageTitle: "Manage business accounting with connected finance workflows",
    manageIntro: "Bizovix keeps operating entries and financial reports connected so owners, accountants, and managers can review cleaner numbers faster.",
    proofTitle: "Accounting checkpoints",
    faqs: [
      { question: "What does the accounting module do in Bizovix ERP?", answer: "It helps teams manage journals, income, expenses, receivables, payables, and financial reporting from connected operating records." },
      { question: "Can sales and purchases connect with accounts?", answer: "Yes. Sales invoices, purchase bills, payments, and stock valuation can be reflected through connected ERP workflows." },
      { question: "Can small businesses start with accounting first?", answer: "Yes. Teams can start with accounting and expand into purchase, inventory, sales, POS, HR, and reporting as needed." },
      { question: "Does it help with cash-flow visibility?", answer: "Yes. Structured receivable, payable, income, expense, and payment records make cash-flow review more practical." },
    ],
  },
  purchase: {
    theme: "cyan",
    reverse: true,
    eyebrow: "Purchase module",
    title: "Why teams use Bizovix Purchase to control procurement",
    summary:
      "Purchase teams need requisitions, supplier comparison, approvals, receiving, bills, and payment tracking to stay connected. Bizovix gives procurement a cleaner path from request to record.",
    reasons: [
      "Organize purchase requisitions and approval responsibility",
      "Keep supplier records, purchase orders, and bills connected",
      "Improve incoming-stock planning before warehouse delays happen",
      "Give finance better visibility into purchase commitments",
    ],
    manageTitle: "Manage requisitions, orders, suppliers, receiving, and payments",
    manageIntro: "Bizovix helps purchase, warehouse, and finance teams work from one procurement flow instead of disconnected calls and spreadsheets.",
    proofTitle: "Purchase checkpoints",
    faqs: [
      { question: "Can Bizovix manage purchase approvals?", answer: "Yes. Purchase workflows can connect requisitions, approvals, supplier records, orders, receiving, and bills." },
      { question: "Does it help with supplier records?", answer: "Yes. Supplier information, transaction history, and payment context can stay organized in connected ERP records." },
      { question: "Can purchase connect with inventory?", answer: "Yes. Goods receiving and stock updates can connect purchase activity with warehouse records." },
      { question: "Can teams track pending purchase orders?", answer: "Yes. Open POs, supplier status, pending approvals, and purchase trends can be reviewed from structured records." },
    ],
  },
  inventory: {
    theme: "emerald",
    eyebrow: "Inventory module",
    title: "Why businesses use Bizovix Inventory for stock accuracy",
    summary:
      "Inventory teams need to know what is in stock, where it is, what moved, and what needs reorder attention. Bizovix keeps stock, warehouse, batch, and transfer records easier to trust.",
    reasons: [
      "Track stock by warehouse, batch, transfer, and movement",
      "Reduce low-stock surprises and branch stock mismatch",
      "Connect purchase receiving, production issue, and sales delivery",
      "Give managers clearer stock value and movement reporting",
    ],
    manageTitle: "Manage stock, warehouses, batches, transfers, and reorders",
    manageIntro: "Bizovix helps warehouse teams maintain structured records while connected departments see reliable stock context.",
    proofTitle: "Inventory checkpoints",
    faqs: [
      { question: "Can Bizovix track multiple warehouses?", answer: "Yes. Inventory workflows can support warehouse-level stock, transfers, movement, and comparison reporting." },
      { question: "Does it support batch tracking?", answer: "Batch-aware records can help teams follow sensitive or controlled stock movement more reliably." },
      { question: "Can inventory connect with sales and purchase?", answer: "Yes. Purchase receiving, sales delivery, returns, and production issue can connect with stock records." },
      { question: "Can managers review low-stock items?", answer: "Yes. Low stock, reorder needs, movement, and stock value can be reviewed through structured ERP records." },
    ],
  },
  manufacturing: {
    theme: "blue",
    reverse: true,
    eyebrow: "Manufacturing module",
    title: "Why production teams use Bizovix Manufacturing ERP",
    summary:
      "Manufacturing teams need bill of materials, work orders, raw material issue, costing, progress updates, and finished-goods records to move together. Bizovix keeps production flow connected.",
    reasons: [
      "Plan production from BOM and material requirements",
      "Track work orders, progress, quality, and finished goods",
      "Connect raw material issue with costing and inventory records",
      "Give production and management teams cleaner operating visibility",
    ],
    manageTitle: "Manage BOM, work orders, production progress, and costing",
    manageIntro: "Bizovix helps factory teams coordinate planning, stock issue, production updates, and reporting with fewer manual gaps.",
    proofTitle: "Manufacturing checkpoints",
    faqs: [
      { question: "Can Bizovix manage work orders?", answer: "Yes. Manufacturing workflows can organize work orders, production updates, and related material movement." },
      { question: "Can BOM connect with inventory?", answer: "Yes. Bill of materials and material issue can connect with stock records for cleaner planning." },
      { question: "Does it help with production costing?", answer: "Bizovix can connect material usage, purchase cost, stock movement, and production records for better review." },
      { question: "Can finished goods update inventory?", answer: "Yes. Finished-goods updates can connect production results with inventory records." },
    ],
  },
  sales: {
    theme: "indigo",
    eyebrow: "Sales module",
    title: "Why sales teams use Bizovix to connect orders and collections",
    summary:
      "Sales teams need quotations, orders, invoices, returns, customer payments, and stock context in one place. Bizovix helps keep the order-to-cash process structured.",
    reasons: [
      "Turn quotations into orders and invoices with fewer manual gaps",
      "Connect invoice, payment, return, and customer account records",
      "Improve customer account visibility for sales and finance teams",
      "Keep sales reporting tied to stock and payment activity",
    ],
    manageTitle: "Manage quotes, sales orders, invoices, returns, and collections",
    manageIntro: "Bizovix gives sales, warehouse, and accounts teams a shared workflow from customer request to payment review.",
    proofTitle: "Sales checkpoints",
    faqs: [
      { question: "Can Bizovix manage quotations and sales orders?", answer: "Yes. Sales workflows can connect quotations, orders, invoices, returns, payments, and customer records." },
      { question: "Does sales connect with inventory?", answer: "Yes. Sales orders, deliveries, returns, and stock updates can work with inventory records." },
      { question: "Can customer payments be tracked?", answer: "Yes. Invoices, collections, and customer account status can connect with accounting workflows." },
      { question: "Can managers review sales performance?", answer: "Yes. Sales orders, invoice status, customer payments, and trends can be reviewed from structured ERP data." },
    ],
  },
  "point-of-sale": {
    theme: "cyan",
    reverse: true,
    eyebrow: "POS module",
    title: "Why retail teams use Bizovix POS for connected store operations",
    summary:
      "Retail teams need fast checkout, connected stock, payment records, returns, discounts, customer history, and daily closing visibility. Bizovix POS keeps counter sales linked with back-office records.",
    reasons: [
      "Process counter sales with connected product and customer records",
      "Update inventory after sales, returns, and stock adjustments",
      "Review daily sales, payment methods, and closing summaries",
      "Connect POS with accounting, inventory, and customer history",
    ],
    manageTitle: "Manage checkout, receipts, returns, stock updates, and daily sales",
    manageIntro: "Bizovix POS gives store teams a practical counter workflow while managers get cleaner stock and sales records.",
    proofTitle: "POS checkpoints",
    faqs: [
      { question: "Can Bizovix POS update inventory?", answer: "Yes. POS transactions can connect with stock records so sales and returns are easier to track." },
      { question: "Does it support daily closing summaries?", answer: "Yes. Daily sales, payment methods, returns, and cash summaries can be reviewed from connected records." },
      { question: "Can POS keep customer history?", answer: "Yes. Customer records and transaction history can stay available to the right teams." },
      { question: "Can multiple stores use Bizovix POS?", answer: "Branch-ready usage depends on setup, but Bizovix can support multi-location retail workflows." },
    ],
  },
  "hr-payroll": {
    theme: "emerald",
    eyebrow: "HR and payroll module",
    title: "Why HR teams use Bizovix to structure employee and payroll records",
    summary:
      "HR teams need employee records, attendance, leave, departments, salary data, and payroll readiness to stay controlled. Bizovix helps make people operations more organized.",
    reasons: [
      "Maintain structured employee and department records",
      "Connect attendance, leave, and payroll preparation",
      "Reduce manual follow-up around approvals and salary inputs",
      "Give management better workforce visibility",
    ],
    manageTitle: "Manage employees, attendance, leave, payroll, and departments",
    manageIntro: "Bizovix helps HR and management teams keep workforce data connected with operating visibility.",
    proofTitle: "HR checkpoints",
    faqs: [
      { question: "Can Bizovix manage employee records?", answer: "Yes. Employee profiles, departments, attendance, leave, and payroll context can stay organized." },
      { question: "Does attendance connect with payroll?", answer: "Attendance and leave data can support payroll preparation depending on the configured workflow." },
      { question: "Can managers review headcount?", answer: "Yes. Headcount, attendance, leave requests, and payroll status can be reviewed through structured records." },
      { question: "Can HR start separately from other modules?", answer: "Yes. HR and payroll can be introduced as a focused module and later connected with broader ERP workflows." },
    ],
  },
  "client-vendor": {
    theme: "indigo",
    reverse: true,
    eyebrow: "Relationship module",
    title: "Why teams use Bizovix Client and Vendor records",
    summary:
      "Customer and supplier information becomes hard to control when contacts, credit terms, transaction history, and account statements live in different places. Bizovix keeps relationship records connected.",
    reasons: [
      "Maintain one reliable record for customers and suppliers",
      "Connect credit terms, invoices, bills, and account statements",
      "Improve receivable and payable follow-up context",
      "Give sales, purchase, and finance teams shared relationship data",
    ],
    manageTitle: "Manage customers, suppliers, credit, contacts, and transaction history",
    manageIntro: "Bizovix helps teams keep relationship data practical for daily sales, purchase, accounting, and service workflows.",
    proofTitle: "Relationship checkpoints",
    faqs: [
      { question: "Can Bizovix store customer and supplier profiles?", answer: "Yes. Client and vendor records can organize contact, credit, account, and transaction information." },
      { question: "Can account statements be reviewed?", answer: "Yes. Transaction history, invoices, bills, receivables, and payables can support account statement review." },
      { question: "Does it connect with sales and purchase?", answer: "Yes. Customer and supplier records can connect with sales, purchase, accounting, and reporting workflows." },
      { question: "Can teams control credit visibility?", answer: "Yes. Credit terms, receivables, payables, and transaction context can be organized for better follow-up." },
    ],
  },
};

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
  const video = solutionVideoMap[solution.slug] ?? solutionVideoMap.inventory;
  const visual = solutionVisualMap[solution.slug] ?? "/images/submenu/Connected%20ERP%20Modules.webp";
  const playbook = solutionPlaybooks[solution.slug];

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
        <div className="container-shell erp-detail-hero-grid erp-detail-hero-grid--with-video">
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
            <div className="erp-detail-hero-actions">
              <a href={siteConfig.erpDownloadPath} download={siteConfig.erpDownloadFileName} className="erp-primary-link">
                Download ERP software <Download size={16} />
              </a>
              <Link href="/pricing" className="erp-secondary-link">
                View pricing
              </Link>
            </div>
          </div>

          <div className="erp-hero-video-shell">
            <div className="erp-video-frame-wrap">
              <AutoPlayVideo
                src={video.src}
                label={`${solution.shortTitle} Bizovix ERP auto-playing ${video.label.toLowerCase()}`}
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

      <section className={`industry-module-section industry-module-section--${playbook.theme}`}>
        <div className="container-shell">
          <div className={`industry-module-intro${playbook.reverse ? " industry-module-intro--reverse" : ""}`}>
            <div className="industry-module-visual" aria-hidden="true">
              <span className="industry-module-orb" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={visual} alt="" loading="lazy" decoding="async" />
              <div className="industry-module-chip industry-module-chip--top">
                <Icon name={solution.icon} />
                <span>{solution.group}</span>
              </div>
              <div className="industry-module-chip industry-module-chip--bottom">
                <Layers3 size={15} />
                <span>{solution.metrics.slice(0, 2).join(" + ")}</span>
              </div>
            </div>
            <div className="industry-module-copy">
              <span className="biz-page-badge">
                <Workflow size={14} /> {playbook.eyebrow}
              </span>
              <h2>{playbook.title}</h2>
              <p>{playbook.summary}</p>
              <ul>
                {playbook.reasons.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`industry-module-manage${playbook.reverse ? " industry-module-manage--reverse" : ""}`}>
            <div className="industry-module-manage-copy">
              <span className="biz-page-badge">
                <Layers3 size={14} /> Connected module plan
              </span>
              <h2>{playbook.manageTitle}</h2>
              <p>{playbook.manageIntro}</p>
              <div className="industry-module-feature-list">
                {solution.workflows.map((item) => (
                  <article key={item}>
                    <span>
                      <Route size={20} />
                    </span>
                    <div>
                      <h3>{item}</h3>
                      <p>Keep this process connected with roles, approvals, records, and reporting in Bizovix ERP.</p>
                    </div>
                  </article>
                ))}
                {relatedIndustries.slice(0, 1).map((industry) => (
                  <article key={industry.slug}>
                    <span>
                      <Icon name={industry.icon} />
                    </span>
                    <div>
                      <h3>{industry.title} fit</h3>
                      <p>{industry.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="industry-module-board">
              <div className="industry-module-board-head">
                <span>{playbook.proofTitle}</span>
                <strong>{solution.metrics.length} metrics</strong>
              </div>
              {solution.metrics.slice(0, 4).map((item, index) => (
                <article className="industry-module-mini-card" key={item}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item}</strong>
                  </div>
                  <p>Use structured records to make this checkpoint easier to review and report.</p>
                </article>
              ))}
            </div>
          </div>

          <div className="industry-module-faq">
            <h2>{solution.shortTitle} ERP FAQs</h2>
            <div className="industry-module-faq-grid">
              {playbook.faqs.map((item) => (
                <details key={item.question} className="industry-module-faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection title={`See how ${solution.shortTitle} fits your operation`} />
    </>
  );
}
