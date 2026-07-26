import type { Metadata } from "next";
import { DemoRequestForm } from "@/components/forms/LeadForms";
import { PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Demo Request",
  description: "Request a personalized Bizovix ERP demo for accounting, inventory, purchase, manufacturing, sales, POS, HR, payroll, dashboards, and multi-branch reporting.",
  path: "/demo-request",
});

export default function DemoRequestPage() {
  return (
    <>
      <PageHero badge="Demo request" title="Request a personalized Bizovix ERP demo" description="Share your company context so the demo can focus on the modules, workflows, and reporting needs that matter most." />
      <section className="section">
        <div className="container-shell two-column demo-layout">
          <div>
            <SectionHeading title="What happens next" description="The Bizovix team reviews your industry, company size, required solutions, and preferred contact method before arranging a consultation." />
            <div className="process-mini-list">
              {[
                ["01", "Workflow discovery", "We identify the departments, branches, users, approvals, and reports your team needs."],
                ["02", "Module fit review", "We match your requirements with Bizovix accounting, inventory, purchase, manufacturing, sales, POS, HR, and reporting modules."],
                ["03", "Demo roadmap", "You receive a focused product walkthrough with rollout priorities and next-step implementation guidance."],
              ].map(([step, title, body]) => (
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
          <DemoRequestForm />
        </div>
      </section>
    </>
  );
}
