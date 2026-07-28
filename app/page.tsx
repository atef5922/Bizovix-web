import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Factory,
  Layers3,
  LifeBuoy,
  MapPin,
  PackageCheck,
  Rocket,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { AutoPlayVideo } from "@/components/ui/AutoPlayVideo";
import { CTASection } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { siteConfig } from "@/src/config/site";
import { faqJsonLd, pageMetadata } from "@/src/lib/seo";
import { faqs } from "@/src/data/faqs";

export const metadata: Metadata = pageMetadata({
  title: "Cloud ERP Software for Bangladesh and South Asia",
  description:
    "Bizovix is a modern cloud ERP platform for businesses across Bangladesh and South Asia, connecting finance, inventory, purchase, manufacturing, sales, POS, HR, payroll, approvals, and reporting.",
});

export default function Home() {
  const bannerSlides = [
    {
      image: "banner1.webp",
      badge: "Next-Gen Cloud ERP Platform",
      title: (
        <>
          One Platform.
          <br />
          Limitless Potential.
          <br />
          <span>Built for the Future.</span>
        </>
      ),
      description:
        "Bizovix ERP unifies your operations, automates workflows, and delivers real-time insights so you can make smarter decisions and scale with confidence.",
    },
    {
      image: "banner2.webp",
      badge: "Innovating The Future",
      title: (
        <>
          Bridging Borders,
          <br />
          Building Digital
          <br />
          <span>Futures</span>
        </>
      ),
      description:
        "Your business software expert for connected teams, cloud operations, secure workflows, and confident growth.",
    },
    {
      image: "banner3.webp",
      badge: "Innovating The Future",
      title: (
        <>
          Empowering Progress Through
          <br />
          <span>Innovation and Intelligence</span>
        </>
      ),
      description:
        "Business operation with vision and intelligence, built for faster decisions across finance, inventory, sales, and production.",
    },
  ];

  const brandCards = [
    {
      name: "Walton",
      logo: "/images/brands/walton.svg",
    },
    {
      name: "PRAN",
      logo: "/images/brands/pran.png",
    },
    {
      name: "RFL",
      logo: "/images/brands/rfl.png",
    },
    {
      name: "Akij Group",
      logo: "/images/brands/akij.png",
    },
    {
      name: "Beximco",
      logo: "/images/brands/beximco.png",
    },
    {
      name: "Keya Group",
      logo: "/images/brands/keya-group.png",
    },
  ];

  const coverageStats = [
    ["8 Countries", "Regional ERP coverage"],
    ["Multi-Currency", "Local and global transactions"],
    ["12+ Modules", "Complete business management"],
    ["Region-Ready", "Tax, payroll and reporting"],
  ];

  const coveragePoints = [
    ["Pakistan", "Trading, wholesale and distribution", "pakistan"],
    ["Bangladesh", "Core operations and ERP support", "bangladesh"],
    ["Nepal", "Retail and growing service teams", "nepal"],
    ["India", "Manufacturing, sales and inventory", "india"],
    ["Sri Lanka", "Finance, logistics and services", "sri-lanka"],
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
    [
      "Certified ERP Process",
      "Secure implementation standards",
      <ShieldCheck key="certified-erp-process" className="h-5 w-5" />,
    ],
    [
      "Regional Support",
      "South Asia-ready rollout team",
      <MapPin key="regional-support" className="h-5 w-5" />,
    ],
    [
      "Industry Fit",
      "Finance, stock, sales, production",
      <Factory key="industry-fit" className="h-5 w-5" />,
    ],
    [
      "Customization",
      "Workflows shaped around your team",
      <Layers3 key="customization" className="h-5 w-5" />,
    ],
    [
      "Growth Stories",
      "Dashboards leaders can trust",
      <Building2 key="growth-stories" className="h-5 w-5" />,
    ],
  ];

  const aboutStats = [
    ["350+", "Happy Clients", <UsersRound key="clients" className="h-6 w-6" />],
    ["15+", "Industries Served", <Building2 key="industries" className="h-6 w-6" />],
    ["5+", "Countries", <MapPin key="countries" className="h-6 w-6" />],
    ["99.9%", "System Uptime", <ShieldCheck key="uptime" className="h-6 w-6" />],
  ];

  const aboutSolutions = [
    ["Accounting & Finance ERP", <ClipboardCheck key="accounting" className="h-4 w-4" />],
    ["Inventory & Warehouse Control", <PackageCheck key="inventory-control" className="h-4 w-4" />],
    ["Sales, POS & CRM Automation", <Building2 key="sales-crm" className="h-4 w-4" />],
    ["Manufacturing & Production Planning", <Factory key="manufacturing-planning" className="h-4 w-4" />],
    ["HR, Payroll & Attendance", <UsersRound key="payroll-attendance" className="h-4 w-4" />],
    ["Approvals, Dashboards & Reports", <BarChart3 key="approvals-reports" className="h-4 w-4" />],
  ];

  const trustReasons = [
    [
      "Business-first ERP implementation",
      "We map finance, inventory, purchase, sales, HR, production, and approval flows before configuring the platform.",
    ],
    [
      "South Asia-ready workflows",
      "Bizovix supports practical regional operations including tax-ready records, payroll needs, multi-currency transactions, branch controls, and management reports.",
    ],
    [
      "Flexible customization",
      "Every team has different approval chains, product structures, and reporting needs, so Bizovix adapts without making daily work complicated.",
    ],
    [
      "Ongoing support and optimization",
      "After rollout, our team helps improve usage, train users, maintain performance, and refine dashboards as your business grows.",
    ],
  ];

  const productTabs = [
    "Finance & Inventory",
    "One Stop ERP",
    "Manufacturing & Sales",
  ];

  const productMetrics = [
    ["01", "Core ERP suite"],
    ["6+", "Connected modules"],
    ["360", "Operational view"],
  ];

  const productPillars = [
    {
      title: productTabs[0],
      body: "Control ledgers, purchases, stock valuation, warehouses, and branch movement from one reliable operating layer.",
      icon: <BarChart3 className="h-5 w-5" />,
      points: ["Accounting control", "Warehouse visibility"],
    },
    {
      title: productTabs[1],
      body: "Bring finance, inventory, POS, CRM, HR, payroll, production, approvals, vendors, customers, and reports together.",
      icon: <PackageCheck className="h-5 w-5" />,
      points: ["Single data source", "Role-based workflows"],
    },
    {
      title: productTabs[2],
      body: "Connect sales orders, production planning, BOM, costing, delivery, approval chains, and management dashboards.",
      icon: <Factory className="h-5 w-5" />,
      points: ["Production planning", "Sales coordination"],
    },
  ];

  const processSteps = [
    {
      title: "Understand & Analyse",
      body: "We study your business goals, branches, users, modules, approval flows, and reporting needs before ERP configuration begins.",
      icon: <ClipboardCheck className="h-6 w-6" />,
    },
    {
      title: "Design & Configure",
      body: "Bizovix sets up finance, stock rules, dashboards, roles, permissions, forms, and workflows around how your team works.",
      icon: <Settings2 className="h-6 w-6" />,
    },
    {
      title: "Implement & Integrate",
      body: "We support data migration, user training, connected workflows, and smooth go-live planning for every department.",
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      title: "Support & Evolve",
      body: "After launch, our team helps optimize usage, refine reports, improve adoption, and keep operations running confidently.",
      icon: <LifeBuoy className="h-6 w-6" />,
    },
  ];

  return (
    <>
      <SEOJsonLd data={faqJsonLd(faqs)} />

      <section
        className="banner-hero"
        aria-label="Bizovix cloud ERP overview"
      >
        <div className="banner-slider">
          {bannerSlides.map((banner, index) => (
            <div
              key={banner.image}
              className="banner-slide"
              style={{
                animationDelay: `${index * 5}s`,
              }}
            >
              <img
                src={`/images/banner/${banner.image}`}
                alt=""
                className="banner-image"
                aria-hidden="true"
              />

              <div className="banner-content">
                <p className="banner-kicker">
                  <span />
                  {banner.badge}
                </p>

                <h2>{banner.title}</h2>

                <div className="banner-rule" />

                <p className="banner-copy">{banner.description}</p>

                <div className="banner-actions">
                  <ButtonLink
                    href={siteConfig.erpDownloadPath}
                    download={siteConfig.erpDownloadFileName}
                    className="banner-action-primary"
                  >
                    Download ERP
                    <Download className="h-3.5 w-3.5" />
                  </ButtonLink>

                  <ButtonLink
                    href="/solutions"
                    variant="secondary"
                    className="banner-action-secondary"
                  >
                    Explore Solutions
                  </ButtonLink>
                </div>
              </div>
            </div>
          ))}

          <div
            className="banner-dots"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section
        className="about-preview"
        aria-label="About Bizovix ERP solutions"
      >
        <div className="container-shell about-preview-grid">
          <div className="about-preview-media">
            <div className="about-photo-pattern" aria-hidden="true" />
            <div className="about-photo-shape about-photo-shape-one" aria-hidden="true" />
            <div className="about-photo-shape about-photo-shape-two" aria-hidden="true" />

            <div className="about-image-frame about-image-frame-main">
              <img
                src="/images/about/about1.webp"
                alt="Bizovix ERP consultants reviewing business analytics"
              />
            </div>

            <div className="about-image-stack">
              <div className="about-image-frame about-image-frame-small">
                <img
                  src="/images/about/about2.webp"
                  alt="Bizovix team planning cloud ERP implementation"
                />
              </div>

              <div className="about-image-frame about-image-frame-small">
                <img
                  src="/images/about/about3.webp"
                  alt="Bizovix ERP team collaborating on business operations"
                />
              </div>
            </div>

            <div className="about-experience-badge">
              <span>
                <ShieldCheck className="h-7 w-7" />
              </span>
              <strong>10+</strong>
              <small>Years of ERP Excellence</small>
            </div>
          </div>

          <div className="about-preview-copy">
            <p className="about-pill">
              <Building2 className="h-4 w-4" />
              About Bizovix
            </p>

            <h2>
              We build cloud <span>ERP solutions</span> for smarter business operations
            </h2>

            <p>
              Bizovix empowers growing businesses in Bangladesh, South Asia,
              and beyond to streamline operations and drive growth. Our secure
              cloud ERP platform connects finance, inventory, sales, HR, and
              more-enabling real-time control, automation, and data-driven
              decisions.
            </p>

            <div className="about-solution-title">
              Our Core ERP Solutions
            </div>

            <div className="about-solution-grid">
              {aboutSolutions.map(([item, icon]) => (
                <span key={item as string}>
                  {icon}
                  {item}
                </span>
              ))}
            </div>

            <div className="about-preview-actions">
              <ButtonLink
                href="/about-us"
                className="about-preview-cta"
              >
                Discover More
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>

            <div className="about-stat-strip">
              {aboutStats.map(([value, label, icon]) => (
                <article key={value as string}>
                  {icon}
                  <div>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="brand-carousel-section"
        aria-label="Brands and industries powered by Bizovix ERP"
      >
        <div className="container-shell brand-carousel-head">
          <p>
            <Layers3 className="h-4 w-4" />
            Connected ERP for ambitious teams
          </p>
        </div>

        <div className="brand-carousel-wrap">
          <div
            className="brand-carousel-track"
            aria-hidden="true"
          >
            {[...brandCards, ...brandCards].map((brand, index) => (
              <div
                className="brand-card"
                key={`${brand.name}-${index}`}
              >
                <img
                  src={brand.logo}
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bd-coverage-section"
        aria-label="Bizovix ERP coverage across South Asia"
      >
        <div className="container-shell bd-coverage-grid">
          <div className="bd-coverage-copy">
            <p className="bd-coverage-pill">
              <MapPin className="h-4 w-4" />
              Built for South Asian Businesses
            </p>

            <h2>
              One Powerful ERP Platform for{" "}
              <span className="title-accent">South Asia’s Growing Businesses</span>
            </h2>

            <p>
              Bizovix helps manufacturers, distributors, retailers, service providers, and multi-branch 
              companies across South Asia manage finance, inventory, sales, purchasing, production, HR, payroll, 
              approvals, and reporting through one secure and scalable cloud ERP platform.
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

          <div
            className="bd-map-card south-asia-map-card"
            aria-label="South Asia map showing Bizovix ERP regional coverage"
          >
            <div className="south-asia-map-wrap">
              <img
                className="bd-map-image south-asia-map-image"
                src="/images/maps/south-asia.svg"
                alt="Map of South Asia showing Bizovix ERP coverage"
              />
            </div>

            <div className="bd-map-hub south-asia-map-hub">
              <img
                src="/brand/bizovix-logo-nav.png"
                alt=""
                aria-hidden="true"
              />

              <strong>Bizovix ERP</strong>
            </div>

            {coveragePoints.map(
              ([country, label, position]) => (
                <div
                  className={`bd-map-point south-asia-map-point south-asia-point-${position}`}
                  key={country}
                >
                  <span />

                  <p>
                    <strong>{country}</strong>
                    {label}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="multi-device-section"
        aria-label="Bizovix multi-device cloud ERP experience"
      >
        <div className="container-shell multi-device-grid">
          <div className="multi-device-copy">
            <p className="multi-device-pill">
              <Settings2 className="h-4 w-4" />
              Multi-Device ERP
            </p>

            <h2>
              The Real <span className="title-accent">Multi-Device ERP</span> Experience
            </h2>

            <p>
              Bizovix cloud ERP keeps finance, inventory, sales,
              purchase, production, and approvals synced across mobile,
              laptop, and desktop, so your team can manage operations
              from head office, warehouse, showroom, or on the move.
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
            <img
              src="/images/The-Real-Multi-Device-Experience.webp"
              alt="Bizovix ERP dashboard syncing between mobile and laptop"
            />
          </div>
        </div>
      </section>

      <section
        className="solution-orbit-section"
        aria-label="Bizovix ERP services for business transformation"
      >
        <div className="container-shell solution-orbit-head">
          <p>
            <Layers3 className="h-4 w-4" />
            Services
          </p>

          <h2>
            Smart ERP services for{" "}
            <span className="title-accent">connected business control</span>
          </h2>

          <span>
            From cloud ERP implementation to inventory, manufacturing,
            finance, and approvals, Bizovix delivers dependable software
            built for long-term operational growth.
          </span>
        </div>

        <div className="container-shell solution-orbit-layout">
          <div className="solution-orbit-column">
            {serviceHighlights
              .slice(0, 2)
              .map((service) => (
                <article
                  className="solution-orbit-card"
                  key={service.title}
                >
                  <div className="solution-orbit-icon">
                    {service.icon}
                  </div>

                  <h3>{service.title}</h3>
                  <p>{service.body}</p>

                  <ArrowRight className="solution-orbit-arrow h-4 w-4" />
                </article>
              ))}
          </div>

          <div className="solution-orbit-center">
            <img
              src="/images/Home-circle.webp"
              alt="Bizovix ERP user working on cloud business software"
            />

            <ButtonLink
              href="/solutions"
              variant="secondary"
              className="solution-orbit-cta"
            >
              Explore Our Services
            </ButtonLink>
          </div>

          <div className="solution-orbit-column">
            {serviceHighlights
              .slice(2)
              .map((service) => (
                <article
                  className="solution-orbit-card"
                  key={service.title}
                >
                  <div className="solution-orbit-icon">
                    {service.icon}
                  </div>

                  <h3>{service.title}</h3>
                  <p>{service.body}</p>

                  <ArrowRight className="solution-orbit-arrow h-4 w-4" />
                </article>
              ))}
          </div>
        </div>
      </section>

      <section
        className="why-trust-section"
        aria-label="Why businesses trust Bizovix ERP"
      >
        <div className="container-shell why-trust-head">
          <p>
            <ShieldCheck className="h-4 w-4" />
            Why Choose Us
          </p>

          <h2>
            Why Businesses Trust <span className="title-accent">Bizovix?</span>
          </h2>

          <span>
            Empowering businesses across Bangladesh and South Asia with
            secure cloud ERP, regional implementation, and practical
            automation that helps teams grow with confidence.
          </span>
        </div>

        <div className="container-shell why-trust-cards">
          {trustSignals.map(
            ([title, body, icon]) => (
              <article
                className="why-trust-card"
                key={title as string}
              >
                <div className="why-trust-icon">
                  {icon}
                </div>

                <strong>{title}</strong>
                <span>{body}</span>
              </article>
            ),
          )}
        </div>

        <div className="container-shell why-trust-detail">
          <h3>
            Why choose <span className="title-accent">Bizovix ERP</span> for your business?
          </h3>

          <p>
            Bizovix is built for companies that need more than software
            installation. We deliver a structured ERP experience that
            connects people, processes, data, and decisions across the
            whole business.
          </p>

          <div className="why-trust-list">
            {trustReasons.map(
              ([title, body]) => (
                <article key={title}>
                  <CheckCircle2 className="h-5 w-5" />

                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="erp-clarity-section"
        aria-label="Bizovix one stop ERP products"
      >
        <div className="container-shell erp-product-shell">
          <div className="erp-clarity-head">
            <p>
              <PackageCheck className="h-4 w-4" />
              Our Products
            </p>

            <h2>
              Run every department from one{" "}
              <span>connected ERP workspace.</span>
            </h2>
          </div>

          <div className="erp-product-layout">
            <div className="erp-product-story">
              <p>
                Bizovix connects accounting, purchase, inventory, sales,
                POS, CRM, HR, payroll, production, approvals, vendors,
                customers, and reports in one cloud ERP platform. Your
                teams get cleaner workflows, faster decisions, and
                stronger control without switching between disconnected
                tools.
              </p>

              <div className="erp-product-metrics" aria-label="Bizovix ERP product highlights">
                {productMetrics.map(([value, label]) => (
                  <article key={value}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </article>
                ))}
              </div>

              <ButtonLink
                href="/solutions"
                variant="secondary"
                className="erp-clarity-button"
              >
                Know More
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>

            <div className="erp-product-console" aria-label="Bizovix ERP live workspace video preview">
              <div className="erp-console-video">
                <AutoPlayVideo
                  src="/videos/bizovix-distribution-preview.mp4"
                  label="Bizovix ERP live workspace auto-playing software preview"
                />
              </div>
            </div>
          </div>

          <div className="erp-product-focus-grid">
            {productPillars.map((product) => (
              <article key={product.title}>
                <div className="erp-product-card-head">
                  <span>{product.icon}</span>
                  <h3>{product.title}</h3>
                </div>
                <p>{product.body}</p>
                <span>{product.points.join(" / ")}</span>
              </article>
            ))}
          </div>

        </div>
      </section>

      <section
        className="process-section"
        aria-label="Bizovix ERP implementation process"
      >
        <div className="container-shell process-head">
          <p className="process-pill">
            <Rocket className="h-4 w-4" />
            Go-Live Process
          </p>

          <h2>
            How Bizovix Helps Your Business{" "}
            <span className="title-accent">Go Live</span>
          </h2>

          <p>
            Transforming operational challenges into connected cloud ERP
            success through a clear, practical, and support-focused
            rollout process.
          </p>
        </div>

        <div className="container-shell process-grid">
          {processSteps.map(
            (step, index) => (
              <article
                className="process-card"
                key={step.title}
              >
                <div className="process-icon">
                  {step.icon}
                  <span>{index + 1}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ),
          )}
        </div>

        <div className="process-action">
          <ButtonLink
            href="/about-us"
            variant="secondary"
            className="process-button"
          >
            About Our Process
          </ButtonLink>
        </div>
      </section>

      <CTASection />
    </>
  );
}
