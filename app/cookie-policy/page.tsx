import type { Metadata } from "next";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "Review Bizovix cookie policy notes for essential website preferences, analytics readiness, support tools, and future marketing technology disclosures.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero badge="Legal" title="Cookie Policy" description="Bizovix uses essential cookie-style local preferences for the website experience. Future analytics or marketing tools should be disclosed here before launch." />
      <section className="section">
        <div className="container-shell article-body">
          <h2>Current use</h2>
          <p>The cookie consent preference is stored locally so visitors do not need to accept the notice repeatedly.</p>
          <h2>Future use</h2>
          <p>Any analytics, advertising, CRM, chat, or support tools should be documented with purpose, retention, and opt-out information before production launch.</p>
          <h2>Visitor control</h2>
          <p>Visitors can clear local browser storage or adjust browser settings to manage preferences. Future consent controls should be aligned with the final production technology stack.</p>
        </div>
      </section>
    </>
  );
}
