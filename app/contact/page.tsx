import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/LeadForms";
import { PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { siteConfig } from "@/src/config/site";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact Bizovix for ERP sales, product demo, implementation, support, partnership, and career inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero badge="Contact" title="Talk with Bizovix" description="Reach the right team for sales, support, partnerships, implementation planning, or career questions." />
      <section className="section"><div className="container-shell two-column"><div><SectionHeading title="Sales and support" description={`${siteConfig.salesEmail} | ${siteConfig.salesPhone}. For support, use ${siteConfig.supportEmail}.`} /></div><ContactForm /></div></section>
    </>
  );
}
