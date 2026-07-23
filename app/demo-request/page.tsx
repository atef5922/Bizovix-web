import type { Metadata } from "next";
import { DemoRequestForm } from "@/components/forms/LeadForms";
import { PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Demo Request",
  description: "Request a personalized Bizovix ERP demo for accounting, inventory, purchase, manufacturing, sales, POS, HR, payroll, and reporting workflows.",
  path: "/demo-request",
});

export default function DemoRequestPage() {
  return (
    <>
      <PageHero badge="Demo request" title="Request a personalized Bizovix ERP demo" description="Share your company context so the demo can focus on the modules, workflows, and reporting needs that matter most." />
      <section className="section"><div className="container-shell two-column"><SectionHeading title="What happens next" description="The Bizovix team reviews your industry, company size, required solutions, and preferred contact method before arranging a consultation." /><DemoRequestForm /></div></section>
    </>
  );
}
