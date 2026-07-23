import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, Factory, Layers3, MapPin, PlayCircle, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { DemoModalButton } from "@/components/ui/SiteTools";
import { DashboardShowcase } from "@/components/product/DashboardShowcase";
import { CTASection, SectionHeading, TrustBand, WorkflowBand } from "@/components/sections/MarketingSections";
import { BlogExplorer, FAQAccordion, IndustrySelector, PricingToggle, ResourceExplorer, SolutionExplorer } from "@/components/sections/InteractiveSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { faqJsonLd, pageMetadata } from "@/src/lib/seo";
import { faqs } from "@/src/data/faqs";

export const metadata: Metadata = pageMetadata({
  title: "Cloud ERP Software in Bangladesh",
  description: "Bizovix connects accounting, inventory, purchase, manufacturing, sales, POS, HR, payroll, clients, vendors, dashboards, and approvals in one cloud ERP platform.",
});

export default function Home() {
  const bannerSlides = [
    {
      image: "banner1.webp",
      badge: "Next-Gen Cloud ERP Platform",
      title: <>One Platform.<br />Limitless Potential.<br /><span>Built for the Future.</span></>,
      description: "Bizovix ERP unifies your operations, automates workflows, and delivers real-time insights so you can make smarter decisions and scale with confidence.",
    },
    {
      image: "banner2.webp",
      badge: "Innovating The Future",
      title: <>Bridging Borders,<br />Building Digital<br /><span>Futures</span></>,
      description: "Your business software expert for connected teams, cloud operations, secure workflows, and confident growth.",
    },
    {
      image: "banner3.webp",
      badge: "Innovating The Future",
      title: <>Empowering Progress Through<br /><span>Innovation and Intelligence</span></>,
      description: "Business operation with vision and intelligence, built for faster decisions across finance, inventory, sales, and production.",
    },
  ];
  const brandCards = [
    { name: "Walton", logo: "/images/brands/walton.svg" },
    { name: "PRAN", logo: "/images/brands/pran.png" },
    { name: "RFL", logo: "/images/brands/rfl.png" },
    { name: "Akij Group", logo: "/images/brands/akij.png" },
    { name: "Beximco", logo: "/images/brands/beximco.png" },
    { name: "Keya Group", logo: "/images/brands/keya-group.png" },
  ];
  const coverageStats = [
    ["8 Divisions", "Cloud ERP support model"],
    ["64 Districts", "Remote rollout ready"],
    ["12+ Modules", "Finance to production"],
    ["BD-ready", "VAT, payroll, reports"],
  ];
  const coveragePoints = [
    ["Dhaka", "Head office, finance, approvals", "dhaka"],
    ["Gazipur", "Manufacturing and inventory", "gazipur"],
    ["Chattogram", "Trading, distribution, warehouse", "chattogram"],
    ["Sylhet", "Multi-branch service teams", "sylhet"],
    ["Khulna", "Sales, POS, stock control", "khulna"],
  ];
  const serviceHighlights = [
    {
      title: "Cloud ERP Implementation",
      body: "Unify accounting, purchase, inventory, sales, POS, HR, payroll, approvals, and reporting in one scalable Bizovix ERP platform.",
      icon: <Layers3 className="h-5 w-5" />,
    },
    {
      title: "Warehouse & Distribution",
      body: "Track stock, transfers, purchase, delivery, branch inventory, and warehouse movement with real-time operational visibility.",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "Manufacturing & Production",
      body: "Plan BOM, work orders, raw materials, finished goods, costing, and production progress from a connected ERP workflow.",
      icon: <Factory className="h-5 w-5" />,
    },
    {
      title: "Secure Finance & Approvals",
      body: "Control receivables, payables, expenses, audit-ready records, approval chains, dashboards, and management reports.",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
  ];
  const trustSignals = [
    ["Certified ERP Process", "Secure implementation standards", <ShieldCheck className="h-5 w-5" />],
    ["Local Support", "Bangladesh-ready rollout team", <MapPin className="h-5 w-5" />],
    ["Industry Fit", "Finance, stock, sales, production", <Factory className="h-5 w-5" />],
    ["Customization", "Workflows shaped around your team", <Layers3 className="h-5 w-5" />],
    ["Growth Stories", "Dashboards leaders can trust", <Building2 className="h-5 w-5" />],
  ];
  const trustReasons = [
    ["Business-first ERP implementation", "We map finance, inventory, purchase, sales, HR, production, and approval flows before configuring the platform."],
    ["Bangladesh-ready workflows", "Bizovix supports practical local operations including VAT-ready records, payroll needs, branch controls, and management reports."],
    ["Flexible customization", "Every team has different approval chains, product structures, and reporting needs, so Bizovix adapts without making daily work complicated."],
    ["Ongoing support and optimization", "After rollout, our team helps improve usage, train users, maintain performance, and refine dashboards as your business grows."],
  ];

  return (
    <>
      <SEOJsonLd data={faqJsonLd(faqs)} />
      <section className="banner-hero" aria-label="Bizovix cloud ERP overview">
        <div className="banner-slider">
          {bannerSlides.map((banner, index) => (
            <div
              key={banner.image}
              className="banner-slide"
              style={{ animationDelay: `${index * 5}s` }}
            >
              <img
                src={`/images/banner/${banner.image}`}
                alt=""
                className="banner-image"
                aria-hidden="true"
              />
              <div className="banner-content">
                <p className="banner-kicker"><span />{banner.badge}</p>
                <h2>{banner.title}</h2>
                <div className="banner-rule" />
                <p className="banner-copy">{banner.description}</p>
                <div className="banner-actions">
                  <ButtonLink href="/demo-request" className="banner-action-primary">
                    Request Demo <ArrowRight className="h-3.5 w-3.5" />
                  </ButtonLink>
                  <ButtonLink href="/solutions" variant="secondary" className="banner-action-secondary">
                    Explore Solutions
                  </ButtonLink>
                </div>
              </div>
            </div>
          ))}
          <div className="banner-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="about-preview" aria-label="About Bizovix ERP solutions">
        <div className="container-shell about-preview-grid">
          <div className="about-preview-media">
            <img className="about-image-main" src="/images/about/about1.webp" alt="Bizovix ERP consultants reviewing business analytics" />
            <div className="about-experience-badge">
              <strong>10+</strong>
              <span>Years ERP Experience</span>
            </div>
            <img className="about-image-secondary" src="/images/about/about2.webp" alt="Bizovix team planning cloud ERP implementation" />
          </div>

          <div className="about-preview-copy">
            <p className="about-pill">About Bizovix</p>
            <h2>We build cloud ERP solutions for smarter business operations</h2>
            <p>
              Bizovix helps growing companies in Bangladesh and beyond connect finance, inventory, sales, purchase, production, HR, payroll, approvals, and reporting in one secure cloud ERP platform. Our team focuses on practical implementation, clean workflows, and real-time business visibility that leaders can trust.
            </p>
            <div className="about-solution-title">Our Core ERP Solutions</div>
            <div className="about-solution-grid">
              {[
                "Accounting & Finance ERP",
                "Inventory & Warehouse Control",
                "Sales, POS & CRM Automation",
                "Manufacturing & Production Planning",
                "HR, Payroll & Attendance",
                "Approvals, Dashboards & Reports",
              ].map((item) => (
                <span key={item}><CheckCircle2 className="h-4 w-4" />{item}</span>
              ))}
            </div>
            <ButtonLink href="/about-us" variant="secondary" className="about-preview-cta">
              Discover More <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="brand-carousel-section" aria-label="Brands and industries powered by Bizovix ERP">
        <div className="container-shell brand-carousel-head">
          <p>Connected ERP for ambitious teams</p>
        </div>
        <div className="brand-carousel-wrap">
          <div className="brand-carousel-track" aria-hidden="true">
            {[...brandCards, ...brandCards].map((brand, index) => (
              <div className="brand-card" key={`${brand.name}-${index}`}>
                <img src={brand.logo} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bd-coverage-section" aria-label="Bizovix ERP coverage across Bangladesh">
        <div className="container-shell bd-coverage-grid">
          <div className="bd-coverage-copy">
            <p className="bd-coverage-pill"><MapPin className="h-4 w-4" />Nationwide ERP Coverage</p>
            <h2>Supporting growing businesses across every corner of Bangladesh</h2>
            <p>
              From Dhaka-based head offices to manufacturing floors, warehouses, retail outlets, and distribution teams across Bangladesh, Bizovix delivers cloud ERP software built for local workflows, Bangladeshi compliance needs, and real-time management visibility.
            </p>
            <div className="bd-coverage-stats">
              {coverageStats.map(([value, label]) => (
                <article key={value}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="bd-map-card" aria-label="Bangladesh map showing Bizovix ERP operating coverage">
            <img className="bd-map-image" src="/images/maps/bangladesh.svg" alt="Bangladesh map" />
            <div className="bd-map-hub">
              <img src="/brand/bizovix-logo-nav.png" alt="" />
              <strong>Bizovix ERP</strong>
            </div>
            {coveragePoints.map(([city, label, position]) => (
              <div className={`bd-map-point bd-map-point-${position}`} key={city}>
                <span />
                <p><strong>{city}</strong>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="multi-device-section" aria-label="Bizovix multi-device cloud ERP experience">
        <div className="container-shell multi-device-grid">
          <div className="multi-device-copy">
            <h2>The Real Multi-Device ERP Experience</h2>
            <p>
              Bizovix cloud ERP keeps finance, inventory, sales, purchase, production, and approvals synced across mobile, laptop, and desktop, so your team can manage operations from head office, warehouse, showroom, or on the move.
            </p>
            <div className="multi-device-stats">
              <article>
                <strong>99.9%</strong>
                <span>Reliable cloud access</span>
              </article>
              <article>
                <strong>Instant</strong>
                <span>Cross-device sync</span>
              </article>
            </div>
          </div>
          <div className="multi-device-media">
            <img src="/images/The-Real-Multi-Device-Experience.webp" alt="Bizovix ERP dashboard syncing between mobile and laptop" />
          </div>
        </div>
      </section>

      <section className="solution-orbit-section" aria-label="Bizovix ERP services for business transformation">
        <div className="container-shell solution-orbit-head">
          <p>Services</p>
          <h2>Innovative ERP Solutions That Power Business Transformation</h2>
          <span>From cloud ERP implementation to inventory, manufacturing, finance, and approvals, Bizovix delivers dependable software built for long-term operational growth.</span>
        </div>
        <div className="container-shell solution-orbit-layout">
          <div className="solution-orbit-column">
            {serviceHighlights.slice(0, 2).map((service) => (
              <article className="solution-orbit-card" key={service.title}>
                <div className="solution-orbit-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <ArrowRight className="solution-orbit-arrow h-4 w-4" />
              </article>
            ))}
          </div>

          <div className="solution-orbit-center">
            <img src="/images/Home-circle.webp" alt="Bizovix ERP user working on cloud business software" />
            <ButtonLink href="/solutions" variant="secondary" className="solution-orbit-cta">
              Explore Our Services
            </ButtonLink>
          </div>

          <div className="solution-orbit-column">
            {serviceHighlights.slice(2).map((service) => (
              <article className="solution-orbit-card" key={service.title}>
                <div className="solution-orbit-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <ArrowRight className="solution-orbit-arrow h-4 w-4" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="why-trust-section" aria-label="Why businesses trust Bizovix ERP">
        <div className="container-shell why-trust-head">
          <p>Why Choose Us</p>
          <h2>Why Businesses Trust Bizovix?</h2>
          <span>Empowering Bangladeshi businesses with secure cloud ERP, local implementation, and practical automation that helps teams grow with confidence.</span>
        </div>

        <div className="container-shell why-trust-cards">
          {trustSignals.map(([title, body, icon]) => (
            <article className="why-trust-card" key={title as string}>
              <div className="why-trust-icon">{icon}</div>
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>

        <div className="container-shell why-trust-detail">
          <h3>Why choose Bizovix ERP for your business?</h3>
          <p>
            Bizovix is built for companies that need more than software installation. We deliver a structured ERP experience that connects people, processes, data, and decisions across the whole business.
          </p>
          <div className="why-trust-list">
            {trustReasons.map(([title, body]) => (
              <article key={title}>
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hero">
        <div className="container-shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Cloud ERP for Bangladesh and Beyond</p>
            <h1>Premium Cloud ERP for Finance, Inventory, Production, and Growth</h1>
            <p className="hero-lead">
              Bizovix brings accounting, purchase, inventory, manufacturing, sales, POS, HR, payroll, approvals, and reporting into one polished operating system for serious teams.
            </p>
            <div className="button-row">
              <ButtonLink href="/demo-request">Request a Free Demo <ArrowRight className="h-4 w-4" /></ButtonLink>
              <ButtonLink href="/solutions" variant="secondary">Explore Solutions</ButtonLink>
              <DemoModalButton label="Watch Product Tour" />
            </div>
            <div className="microcopy">
              <span><CheckCircle2 className="h-4 w-4 text-[var(--success)]" />Personalized consultation</span>
              <span><CheckCircle2 className="h-4 w-4 text-[var(--success)]" />No credit card required</span>
            </div>
            <div className="hero-proof" aria-label="Bizovix platform highlights">
              <span><ShieldCheck className="h-4 w-4" /> Secure approvals</span>
              <span><Factory className="h-4 w-4" /> Production-ready</span>
              <span><Building2 className="h-4 w-4" /> Multi-branch control</span>
            </div>
          </div>
          <div className="hero-visual">
            <DashboardShowcase />
          </div>
        </div>
      </section>

      <section className="signal-band" aria-label="ERP capability summary">
        <div className="container-shell signal-grid">
          {[
            ["Core modules", "12+", "Finance, stock, sales, HR, production"],
            ["Operating view", "Live", "Dashboards, approvals, and alerts"],
            ["Rollout model", "Modular", "Start focused and expand cleanly"],
            ["Business fit", "BD + Global", "Local operations, scalable controls"],
          ].map(([label, value, body]) => (
            <article key={label}>
              <Layers3 className="h-5 w-5" />
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <TrustBand />

      <section className="section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Operational clarity"
            title="Replace scattered files, disconnected teams, and delayed reports with one operating record"
            description="Bizovix helps production, finance, warehouse, sales, purchase, HR, and leadership teams understand the same business reality."
          />
          <div className="card-grid">
            {[
              ["Finance waits for stock updates", "Inventory valuation, purchase bills, invoices, and receivables need to move together."],
              ["Production lacks material visibility", "Work orders become easier to plan when raw materials, purchase, warehouse, and costing are connected."],
              ["Leadership sees reports too late", "Dashboards should surface sales trends, production progress, stock alerts, approvals, and attendance quickly."],
              ["Branches work in separate systems", "Multi-branch and multi-company operations need shared controls without losing local context."],
            ].map(([title, body]) => (
              <article className="feature-card" key={title}>
                <PlayCircle className="h-6 w-6 text-[var(--primary)]" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Solutions"
            title="ERP modules built around the way real businesses operate"
            description="Explore finance, commerce, production, warehouse, people, client, and vendor workflows from one organized platform."
          />
          <SolutionExplorer />
        </div>
      </section>

      <WorkflowBand />

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Industries"
            title="Designed for production companies, SMEs, and enterprise operations"
            description="Bizovix content is tailored to Bangladesh-relevant business models while keeping the platform ready for global operations."
          />
          <IndustrySelector />
        </div>
      </section>

      <section className="section">
        <div className="container-shell two-column">
          <div>
            <SectionHeading
              eyebrow="Implementation"
              title="A serious ERP rollout needs consultation, configuration, training, and adoption support"
              description="The Bizovix journey is demo-led so your team can discuss modules, users, branches, data migration, reporting needs, and rollout priorities before choosing a plan."
            />
            <div className="button-row">
              <ButtonLink href="/demo-request">Plan Your Demo</ButtonLink>
              <ButtonLink href="/resources/checklists" variant="secondary">Use Checklist</ButtonLink>
            </div>
          </div>
          <DashboardShowcase compact />
        </div>
      </section>

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent paths without unsupported fixed-price promises"
            description="ERP scope depends on modules, users, branches, migration, training, and integrations. Bizovix keeps pricing tied to the implementation reality."
          />
          <PricingToggle />
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <SectionHeading eyebrow="Resources" title="Helpful ERP planning content for decision makers" description="Guides, checklists, updates, and practical articles help teams prepare for a more productive demo." />
          <ResourceExplorer />
        </div>
      </section>

      <section className="section soft">
        <div className="container-shell">
          <SectionHeading eyebrow="Blog" title="Practical ERP articles for operations, finance, and production teams" />
          <BlogExplorer />
        </div>
      </section>

      <section className="section">
        <div className="container-shell two-column">
          <SectionHeading eyebrow="FAQ" title="Questions teams usually ask before an ERP demo" description="Straight answers, no inflated claims." />
          <FAQAccordion />
        </div>
      </section>

      <CTASection />
    </>
  );
}
