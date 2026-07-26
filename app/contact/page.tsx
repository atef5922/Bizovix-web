import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/LeadForms";
import { PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { siteConfig } from "@/src/config/site";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact Bizovix for cloud ERP software demos, implementation planning, sales support, partnerships, and business automation guidance in Bangladesh and South Asia.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero badge="Contact" title="Talk with Bizovix" description="Reach the right team for sales, support, partnerships, implementation planning, or career questions." />
      <section className="section">
        <div className="container-shell two-column contact-layout">
          <div>
            <SectionHeading title="Sales and support" description={`${siteConfig.salesEmail} | ${siteConfig.salesPhone}. For support, use ${siteConfig.supportEmail}.`} />
            <div className="contact-proof-grid">
              {[
                ["ERP demo", "Review modules, user roles, branches, workflows, and reporting goals."],
                ["Implementation", "Discuss data migration, training, approvals, and rollout phases."],
                ["Support route", "Send product, account, documentation, or workflow questions to the right team."],
              ].map(([title, body]) => (
                <article className="contact-proof-card" key={title}>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </article>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
