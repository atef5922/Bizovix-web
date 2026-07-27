import type { Metadata } from "next";
import { BadgeCheck, BriefcaseBusiness, CheckCircle2, Code2, Headphones, Layers3, Send, UsersRound } from "lucide-react";
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

const hiringSteps = [
  ["01", "Profile Review", "We review your role interest, work samples, communication, and alignment with Bizovix product needs."],
  ["02", "Focused Conversation", "A practical discussion around ERP workflows, problem solving, collaboration, and growth expectations."],
  ["03", "Role Fit Plan", "If there is a fit, we align responsibilities, onboarding focus, and the first outcomes you can own."],
];

export default function CareerPage() {
  return (
    <>
      <section className="contact-page-hero career-reference-hero">
        <div className="container-shell contact-page-hero-inner">
          <p>Careers</p>
          <h1>Build your career with Bizovix ERP</h1>
        </div>
      </section>

      <section className="reference-main-section">
        <div className="container-shell reference-main-card career-reference-card">
          <div className="reference-main-info">
            <p className="contact-kicker">Join the Bizovix team</p>
            <h2>Work on cloud ERP products that help growing businesses run with connected clarity.</h2>
            <p>
              Bizovix is looking for people who care about product craft, customer understanding,
              reliable execution, and practical business transformation across finance, inventory,
              purchase, manufacturing, sales, POS, HR payroll, dashboards, and implementation support.
            </p>
            <div className="contact-support-list">
              {values.map((item) => (
                <span key={item}><BadgeCheck className="h-4 w-4" />{item}</span>
              ))}
            </div>
          </div>

          <div className="reference-blue-panel career-application-panel" id="career-form">
            <p className="reference-panel-title">Share your profile with Bizovix. Tell us your role interest, experience, portfolio, and why ERP product work interests you.</p>
            <CareerForm />
          </div>
        </div>
      </section>

      <section className="reference-support-section">
        <div className="container-shell">
          <div className="biz-section-heading">
            <p className="biz-page-badge"><UsersRound className="h-4 w-4" />Open Work Areas</p>
            <h2>Choose the path where your skills can create real business value</h2>
          </div>
          <div className="biz-feature-grid three">
            {careerTracks.map((track) => {
              const Icon = track.icon;
              return (
                <article className="biz-feature-card" key={track.title}>
                  <div className="biz-feature-card-head">
                    <span><Icon className="h-5 w-5" /></span>
                    <h3>{track.title}</h3>
                  </div>
                  <p>{track.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="career-process-section">
        <div className="container-shell career-process-layout">
          <div className="career-process-copy">
            <p className="biz-page-badge"><CheckCircle2 className="h-4 w-4" />Hiring Process</p>
            <h2>Clear, practical, and focused on real role fit</h2>
            <p>
              We keep the career process structured and respectful. The goal is to understand how you think,
              communicate, learn, and contribute to ERP product, implementation, support, or growth work.
            </p>
          </div>
          <div className="career-process-list">
            {hiringSteps.map(([number, title, body]) => (
              <article key={title}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-bottom-cta">
        <div className="container-shell contact-bottom-inner">
          <div>
            <Layers3 className="h-6 w-6" />
            <h2>Want to grow with ERP product work?</h2>
            <p>Send your profile and role interest. Our team will review alignment with product, engineering, implementation, growth, or support needs.</p>
          </div>
          <a href="#career-form">
            Submit career interest <Send className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
