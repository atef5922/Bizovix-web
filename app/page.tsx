import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardCheck,
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
import { CTASection } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
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

  const aboutMetrics = [
    ["12+", "ERP modules"],
    ["Real-time", "Operational visibility"],
    ["Role-based", "Secure approvals"],
  ];

  const aboutGalleryImages = [
    {
      className: "about-photo-main",
      src: "/images/about/about1.webp",
      alt: "Bizovix ERP consultants reviewing business analytics",
    },
    {
      className: "about-photo-small",
      src: "/images/about/about2.webp",
      alt: "Bizovix team planning cloud ERP implementation",
    },
    {
      className: "about-photo-small",
      src: "/images/submenu/Connected ERP Modules.webp",
      alt: "Bizovix connected ERP modules preview",
    },
  ];

  const aboutSolutionCards = [
    {
      title: "Finance & inventory control",
      body: "Accounting, purchase, vendor bills, stock movement, warehouse records, and approval chains stay connected from entry to report.",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Sales, POS & customer flow",
      body: "Quotations, orders, counter sales, returns, collections, and customer history move through one reliable revenue workflow.",
      icon: <PackageCheck className="h-5 w-5" />,
    },
    {
      title: "Production & team operations",
      body: "BOM, work orders, HR, payroll, attendance, dashboards, and management reports align around your actual operating model.",
      icon: <Factory className="h-5 w-5" />,
    },
  ];

  const aboutWorkflow = [
    ["01", "Map", "Teams, branches and approval paths"],
    ["02", "Configure", "Modules, roles and reporting logic"],
    ["03", "Optimize", "Training, adoption and improvements"],
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

  const erpModules = [
    ["Finance", <BarChart3 key="finance" className="h-4 w-4" />],
    ["Inventory", <PackageCheck key="inventory" className="h-4 w-4" />],
    ["Sales & POS", <Building2 key="sales-pos" className="h-4 w-4" />],
    ["HR & Payroll", <UsersRound key="hr-payroll" className="h-4 w-4" />],
    ["Production", <Factory key="production" className="h-4 w-4" />],
    ["Reports", <ClipboardCheck key="reports" className="h-4 w-4" />],
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
                    href="/demo-request"
                    className="banner-action-primary"
                  >
                    Request Demo
                    <ArrowRight className="h-3.5 w-3.5" />
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
          <div className="about-preview-copy">
            <p className="about-pill">
              <span />
              About Bizovix
            </p>

            <h2>
              Premium Cloud ERP for Finance, Inventory, Production, and Growth
            </h2>

            <p>
              Bizovix helps growing companies in Bangladesh, South Asia,
              and beyond connect finance, purchase, inventory, sales,
              POS, manufacturing, HR, payroll, approvals, and reporting
              in one secure cloud ERP platform. The focus is practical:
              cleaner workflows, reliable data, and real-time visibility
              leaders can trust before the next decision.
            </p>

            <div className="about-metric-row">
              {aboutMetrics.map(([value, label]) => (
                <article key={value}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>

            <div className="about-action-row">
              <ButtonLink
                href="/demo-request"
                className="about-demo-cta"
              >
                Request a Free Demo
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>

              <ButtonLink
                href="/about-us"
                variant="secondary"
                className="about-preview-cta"
              >
                Discover More
              </ButtonLink>
            </div>

            <div className="about-assurance-row">
              <span>
                <ShieldCheck className="h-4 w-4" />
                Secure implementation
              </span>

              <span>
                <CheckCircle2 className="h-4 w-4" />
                Practical regional workflows
              </span>
            </div>
          </div>

          <div
            className="about-preview-media"
            aria-label="Bizovix ERP implementation and analytics preview"
          >
            <div className="about-photo-frame">
              <div className="about-photo-frame-head">
                <span>Bizovix operating platform</span>
                <strong>Implementation view</strong>
              </div>

              <div className="about-photo-grid">
                {aboutGalleryImages.map((image) => (
                  <img
                    className={image.className}
                    src={image.src}
                    alt={image.alt}
                    key={image.src}
                  />
                ))}
              </div>

              <div className="about-photo-footer">
                <div className="about-experience-badge">
                  <strong>10+</strong>
                  <span>Years ERP Experience</span>
                </div>

                <p>
                  Finance, stock, sales, production, HR, and approvals are
                  organized into one implementation plan before go-live.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-shell about-solution-panel">
          <div className="about-solution-title">
            <span>Our Core ERP Solutions</span>
            <strong>Connected modules for the full operating cycle</strong>
          </div>

          <div className="about-solution-grid">
            {aboutSolutionCards.map((item) => (
              <article
                className="about-solution-card"
                key={item.title}
              >
                <div>
                  <span>{item.icon}</span>
                  <strong>{item.title}</strong>
                </div>

                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div
            className="about-workflow-strip"
            aria-label="Bizovix ERP implementation flow"
          >
            {aboutWorkflow.map(([step, title, body]) => (
              <article key={step}>
                <span>{step}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="brand-carousel-section"
        aria-label="Brands and industries powered by Bizovix ERP"
      >
        <div className="container-shell brand-carousel-head">
          <p>Connected ERP for ambitious teams</p>
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
              One Powerful ERP Platform for South Asia’s Growing Businesses
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
            <h2>
              The Real Multi-Device ERP Experience
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
          <p>Services</p>

          <h2>
            Innovative ERP Solutions That Power Business Transformation
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
          <p>Why Choose Us</p>

          <h2>
            Why Businesses Trust Bizovix?
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
            Why choose Bizovix ERP for your business?
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
        <div className="container-shell erp-clarity-head">
          <p>Our Products</p>

          <h2>
            From Complexity to Clarity. One ERP for Every Team.
          </h2>
        </div>

        <div
          className="container-shell erp-tab-row"
          role="list"
          aria-label="Bizovix ERP product focus"
        >
          {productTabs.map((tab) => (
            <span
              className={
                tab === "One Stop ERP"
                  ? "is-active"
                  : ""
              }
              key={tab}
              role="listitem"
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="container-shell erp-clarity-grid">
          <div className="erp-clarity-copy">
            <h3>
              Your one-stop ERP solution for everything your business
              needs
            </h3>

            <p>
              Bizovix connects accounting, purchase, inventory, sales,
              POS, CRM, HR, payroll, production, approvals, vendors,
              customers, and reports in one cloud ERP platform. Your
              teams get cleaner workflows, faster decisions, and
              stronger control without switching between disconnected
              tools.
            </p>

            <ButtonLink
              href="/solutions"
              variant="secondary"
              className="erp-clarity-button"
            >
              Know More
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>

          <div
            className="erp-wheel"
            aria-label="Bizovix ERP connected modules"
          >
            <div className="erp-wheel-center">
              <strong>ERP</strong>
              <span>Bizovix Cloud Suite</span>
            </div>

            {erpModules.map(
              ([label, icon], index) => (
                <div
                  className={`erp-wheel-item erp-wheel-item-${index + 1}`}
                  key={label as string}
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="container-shell erp-ai-row">
          <div className="erp-ai-callout">
            <Bot className="h-7 w-7" />

            <div>
              <span>Click here for</span>
              <strong>
                AI-Powered ERP Recommendation Support
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className="process-section"
        aria-label="Bizovix ERP implementation process"
      >
        <div className="container-shell process-head">
          <h2>
            How Bizovix Helps Your Business Go Live
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
