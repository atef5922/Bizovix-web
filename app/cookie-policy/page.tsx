import type { Metadata } from "next";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Cookie Policy", description: "Bizovix cookie policy page for essential site preferences and future analytics disclosures.", path: "/cookie-policy" });

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero badge="Legal" title="Cookie Policy" description="Bizovix uses essential cookie-style local preferences for the website experience. Future analytics or marketing tools should be disclosed here before launch." />
      <section className="section"><div className="container-shell article-body"><h2>Current use</h2><p>The cookie consent preference is stored locally so visitors do not need to accept the notice repeatedly.</p><h2>Future use</h2><p>Any analytics, advertising, or support tools should be documented with purpose, retention, and opt-out information.</p></div></section>
    </>
  );
}
