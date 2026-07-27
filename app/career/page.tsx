import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Code2, Headphones, Layers3, Rocket, UsersRound } from "lucide-react";
import { CareerForm } from "@/components/forms/LeadForms";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Careers at Bizovix",
  description: "Join Bizovix careers across ERP product engineering, implementation, customer success, design, marketing, sales, and operations in Bangladesh.",
  path: "/career",
});

const careerTracks = [
  { title: "Product Engineering", body: "Build ERP modules, dashboards, integrations, reporting experiences, and scalable business workflows.", icon: Code2 },
  { title: "Implementation & Support", body: "Help companies map processes, configure modules, train users, and move toward confident ERP adoption.", icon: Headphones },
  { title: "Growth & Operations", body: "Work across sales, marketing, partnerships, client success, and operational planning for growing companies.", icon: BriefcaseBusiness },
];

const values = [
  "Customer-first product thinking",
  "Reliable engineering and delivery habits",
  "Clear communication across teams",
  "Practical learning with real business context",
];

export default function CareerPage() {
  return (
    <>
      <section className="biz-page-hero career-hero">
        <div className="container-shell biz-page-hero-grid">
          <div className="biz-page-hero-copy">
            <p className="biz-page-badge"><Rocket className="h-4 w-4" />Careers at Bizovix</p>
            <h1>Build the future of connected ERP for growing businesses</h1>
            <p>
              Join a focused team working on cloud ERP software for finance, inventory, purchase,
              manufacturing, POS, HR payroll, reporting, and implementation-ready business operations.
            </p>
            <div className="biz-hero-actions">
              <a href="#career-form">Share your profile <ArrowRight className="h-4 w-4" /></a>
              <span>Product, implementation, support, sales, design, and growth roles</span>
            </div>
          </div>
          <div className="career-hero-panel">
            {["Product craft", "ERP domain learning", "Client impact", "Team ownership"].map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="biz-section compact">
        <div className="container-shell">
          <div className="biz-section-heading">
            <p className="biz-page-badge">Open Work Areas</p>
            <h2>Choose the path where your skills can create real business value</h2>
          </div>
          <div className="biz-feature-grid three">
            {careerTracks.map((track) => {
              const Icon = track.icon;
              return (
                <article className="biz-feature-card" key={track.title}>
                  <span><Icon className="h-5 w-5" /></span>
                  <h3>{track.title}</h3>
                  <p>{track.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="biz-section career-culture-section">
        <div className="container-shell career-culture-grid">
          <div>
            <p className="biz-page-badge"><UsersRound className="h-4 w-4" />How we work</p>
            <h2>Small team focus, professional standards, and practical ERP learning</h2>
            <p>
              Bizovix values people who can understand business workflows, communicate clearly,
              improve steadily, and take ownership of useful product and customer outcomes.
            </p>
          </div>
          <div className="career-value-list">
            {values.map((item) => (
              <span key={item}><BadgeCheck className="h-4 w-4" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="biz-section compact" id="career-form">
        <div className="container-shell biz-form-layout">
          <div className="biz-form-copy">
            <p className="biz-page-badge"><Layers3 className="h-4 w-4" />Career Interest</p>
            <h2>Share your profile with the Bizovix team</h2>
            <p>
              Tell us about your role interest, portfolio, LinkedIn profile, and why you want to work
              on ERP products for Bangladeshi and South Asian businesses.
            </p>
            <div className="biz-mini-steps">
              {["Profile review", "Role alignment", "Conversation"].map((item, index) => (
                <span key={item}><strong>{String(index + 1).padStart(2, "0")}</strong>{item}</span>
              ))}
            </div>
          </div>
          <div className="biz-form-card">
            <CareerForm />
          </div>
        </div>
      </section>
    </>
  );
}
