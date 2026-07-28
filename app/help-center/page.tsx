import type { Metadata } from "next";
import { CTASection, PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Help Center",
  description: "Get Bizovix ERP help for onboarding, implementation, module configuration, workflow questions, reporting, and support requests.",
  path: "/help-center",
});

export default function HelpCenterPage() {
  return (
    <>
      <PageHero
        badge="Help center"
        title={<>Support for teams adopting <span className="title-accent">connected ERP workflows</span></>}
        description="Find prepared paths for onboarding, support, implementation questions, and product guidance."
      />
      <section className="section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Support paths"
            title={<>Choose the help route that matches your <span className="title-accent">ERP need</span></>}
            description="Bizovix support content is organized for business users, department managers, implementation teams, and decision makers."
          />
          <div className="card-grid">
            {[
              ["Implementation support", "Plan onboarding, user roles, branch setup, approval paths, and data preparation."],
              ["Training requests", "Prepare finance, inventory, production, sales, POS, HR, and reporting users for adoption."],
              ["Workflow questions", "Clarify how purchase, sales, stock, accounting, payroll, and dashboards connect."],
              ["Account assistance", "Route access, billing, demo, contact, and product questions to the right team."],
            ].map(([title, body]) => (
              <article className="feature-card" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
