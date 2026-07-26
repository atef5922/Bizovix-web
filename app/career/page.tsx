import type { Metadata } from "next";
import { CareerForm } from "@/components/forms/LeadForms";
import { PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Career",
  description: "Explore Bizovix career opportunities across ERP product, engineering, implementation, customer success, design, sales, and operations.",
  path: "/career",
});

export default function CareerPage() {
  return (
    <>
      <PageHero badge="Careers" title="Help build ERP software for ambitious operating teams" description="Bizovix is prepared for people who care about product craft, customer understanding, and practical business transformation." />
      <section className="section soft">
        <div className="container-shell card-grid">
          {[
            ["Product and engineering", "Build reliable ERP modules, dashboards, integrations, and customer-facing experiences."],
            ["Implementation and support", "Help businesses configure workflows, train teams, and adopt connected operations."],
            ["Growth and operations", "Work with prospects, partners, and internal teams to turn ERP needs into practical plans."],
          ].map(([title, body]) => (
            <article className="feature-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container-shell two-column">
          <SectionHeading title="Share your profile" description="Use the career form to express interest in product, engineering, implementation, support, sales, or operations roles." />
          <CareerForm />
        </div>
      </section>
    </>
  );
}
