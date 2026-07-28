import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Eye, Goal, Mail, MapPin, Phone, Quote, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { CTASection } from "@/components/sections/MarketingSections";
import { siteConfig } from "@/src/config/site";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Bizovix ERP",
  description:
    "Learn about Bizovix, a cloud ERP software company helping Bangladeshi and South Asian businesses connect accounting, inventory, purchase, sales, manufacturing, HR, payroll, and reporting.",
  path: "/about-us",
});

const clients = [
  "Manufacturing groups",
  "Garments and textile teams",
  "Wholesale distributors",
  "Retail and POS networks",
  "Pharmaceutical operations",
  "Food and beverage businesses",
  "Service companies",
  "Multi-branch enterprises",
];

const teamMembers = [
  {
    name: "Md. Saiful Islam Shajib",
    role: "Founder & CEO",
    image: "/images/team/ceo.webp",
  },
  {
    name: "Sharif Uddin",
    role: "Head of IT",
    image: "/images/team/head-it.webp",
  },
  {
    name: "Md. Atef Ashab Sifat",
    role: "Full-Stack Web Developer",
    image: "/images/team/sifat.webp",
  },
  {
    name: "Abdur Rahim",
    role: "Web Developer | SEO",
    image: "/images/team/rahim.webp",
  },
  {
    name: "Shishir Khondokar",
    role: "Full-Stack Web Developer",
    image: "/images/team/sishir.webp",
  },
  {
    name: "Mohammad Sajjadur Rahman",
    role: "Project & Marketing Officer",
    image: "/images/team/sazzad.webp",
  },
  {
    name: "Minhazul Islam",
    role: "UI/UX Designer",
    image: "/images/team/Minhaj.webp",
  },
  {
    name: "Sumaiya Akter",
    role: "Digital Marketer",
    image: "/images/team/sumaiya.jpeg",
  },
  {
    name: "Rifat Antora",
    role: "Client Relationship Officer",
    image: "/images/team/Ontora.png",
  },
  {
    name: "Zannatul Maoya",
    role: "Sales Executive",
    image: "/images/team/maoya.webp",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="about-page-hero">
        <div className="container-shell about-page-hero-inner">
          <p className="about-page-badge">About Bizovix</p>
          <h1>Empowering businesses with smarter cloud ERP solutions</h1>
          <p>
            Bizovix helps growing companies in Bangladesh and South Asia connect
            finance, inventory, purchase, manufacturing, sales, POS, HR,
            payroll, approvals, and reporting in one secure operating platform.
          </p>
        </div>
      </section>

      <section className="about-partner-section">
        <div className="container-shell about-partner-grid">
          <div className="about-partner-image">
            <img src="/images/about/about1.webp" alt="Bizovix ERP implementation team working with business software" />
          </div>
          <div className="about-partner-copy">
            <p className="about-section-pill">Trusted ERP partner</p>
            <h2>
              Your cloud ERP solution partner for{" "}
              <span className="title-accent">Bangladesh and beyond</span>
            </h2>
            <h3>Smarter business management through connected ERP implementation</h3>
            <p>
              Bizovix simplifies enterprise management through next-generation
              cloud ERP software built around the way real businesses operate.
              From finance and inventory to manufacturing, retail, HR, payroll,
              approvals, and dashboards, our platform helps leadership teams
              make faster decisions with cleaner operational visibility.
            </p>
            <div className="about-contact-row">
              <span><Mail className="h-4 w-4" />{siteConfig.salesEmail}</span>
              <span><Phone className="h-4 w-4" />{siteConfig.salesPhone}</span>
              <span><MapPin className="h-4 w-4" />{siteConfig.address}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-who-section">
        <div className="container-shell">
          <div className="about-centered-heading">
            <p className="about-section-pill">Who we are</p>
            <h2>
              Built to modernize{" "}
              everyday <span className="title-accent">business operations</span>
            </h2>
            <p>
              Bizovix is designed for companies that need practical ERP adoption,
              local business understanding, and a scalable platform for long-term
              growth. We focus on clear implementation, useful dashboards, and
              workflows teams can actually use.
            </p>
          </div>
          <div className="about-mission-grid">
            <article className="about-mission-card">
              <span><Goal className="h-7 w-7" /></span>
              <h3>Mission</h3>
              <p>
                To empower Bangladeshi and South Asian businesses with reliable
                cloud ERP tools that improve accuracy, productivity, accountability,
                and real-time decision making.
              </p>
            </article>
            <div className="about-circle-image">
              <img src="/images/about/about2.webp" alt="Business team reviewing ERP analytics and digital transformation planning" />
            </div>
            <article className="about-mission-card">
              <span><Eye className="h-7 w-7" /></span>
              <h3>Vision</h3>
              <p>
                To become a trusted ERP platform for ambitious regional businesses
                by combining global software standards with local workflow,
                compliance, and support needs.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="ceo-message-section">
        <div className="container-shell">
          <div className="ceo-section-heading">
            <p className="about-section-pill">CEO Message</p>
            <h2>
              A message from our <span className="title-accent">founder</span>
            </h2>
            <p>
              Leadership focused on practical ERP adoption, reliable technology,
              and long-term digital growth for Bangladeshi businesses.
            </p>
          </div>
          <div className="ceo-message-card">
            <div className="ceo-profile-panel">
              <div className="ceo-portrait-wrap">
                <img src="/images/ceo/ceo.webp" alt="Md. Saiful Islam Shajib, Founder and CEO of Bizovix" />
              </div>
              <div className="ceo-profile-meta">
                <h3>Md. Saiful Islam Shajib</h3>
                <p>Founder & CEO, Bizovix</p>
              </div>
            </div>
            <div className="ceo-message-copy">
              <div className="ceo-message-title-row">
                <Quote className="ceo-quote-icon" aria-hidden="true" />
                <h3>Welcome to Bizovix</h3>
              </div>
              <p>
                Bizovix was founded with a clear purpose: to make enterprise
                software more practical, accessible, and valuable for growing
                businesses. In many organizations, finance, inventory, purchase,
                production, sales, HR, approvals, and reporting still operate in
                separate systems or manual files. That creates delays, uncertainty,
                and pressure on leadership teams.
              </p>
              <p>
                Our mission is to help companies build one connected operating
                platform where teams can work with accurate data, structured
                workflows, and real-time visibility. Bizovix is designed for the
                business reality of Bangladesh and South Asia, while following the
                quality, scalability, and user experience standards expected from
                a modern cloud ERP platform.
              </p>
              <p>
                We are committed to being more than a software provider. We want
                to be a dependable transformation partner for companies that are
                ready to improve accountability, reduce manual work, and grow with
                confidence.
              </p>
              <div className="ceo-message-tags">
                <span>Founder-led vision</span>
                <span>Bangladesh-ready ERP</span>
                <span>Operational transformation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container-shell">
          <div className="team-section-heading">
            <p className="about-section-pill">Our Team</p>
            <h2>
              The people behind <span className="title-accent">Bizovix ERP</span>
            </h2>
            <p>
              A focused group of technology, product, design, marketing, and
              client success professionals working together to make ERP adoption
              simpler, faster, and more useful for growing businesses.
            </p>
          </div>
          <div className="team-slider" aria-label="Bizovix team members">
            <div className="team-track">
              {[...teamMembers, ...teamMembers].map((member, index) => (
                <article className="team-card" key={`${member.name}-${index}`}>
                  <div className="team-photo">
                    {member.image ? (
                      <img src={member.image} alt={`${member.name}, ${member.role} at Bizovix`} />
                    ) : (
                      <span aria-hidden="true">
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="team-card-body">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-blue-cta">
        <div className="container-shell about-blue-cta-inner">
          <div>
            <p>Implementation-ready ERP</p>
            <h2>Reduce manual work, improve visibility, and scale with confidence.</h2>
          </div>
          <ButtonLink href="/demo-request" variant="secondary" className="about-blue-cta-button">
            Book an Appointment <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      <section className="about-proof-section">
        <div className="container-shell about-proof-grid">
          <article>
            <p className="about-section-pill">ERP partnership</p>
            <h2>
              Implementation support that fits{" "}
              <span className="title-accent">your business reality</span>
            </h2>
            <p>
              Bizovix helps teams plan ERP adoption with a clear understanding of
              departments, branches, warehouses, user roles, approvals, reporting
              depth, and data migration needs. The goal is practical transformation,
              not software complexity.
            </p>
            <div className="about-proof-points">
              {[
                "Accounting and finance ERP",
                "Inventory and warehouse control",
                "Manufacturing and production planning",
                "Sales, POS, CRM, HR, payroll, and reports",
              ].map((item) => (
                <span key={item}><ShieldCheck className="h-4 w-4" />{item}</span>
              ))}
            </div>
          </article>
          <article>
            <p className="about-section-pill">Who Bizovix serves</p>
            <h2>
              Relevant for growing companies across{" "}
              <span className="title-accent">key industries</span>
            </h2>
            <div className="about-client-list">
              {clients.map((client) => (
                <span key={client}><CheckCircle2 className="h-4 w-4" />{client}</span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <CTASection title="Looking for a reliable ERP implementation partner?" />
    </>
  );
}
