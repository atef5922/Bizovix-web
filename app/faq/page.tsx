import type { Metadata } from "next";
import { FAQAccordion } from "@/components/sections/InteractiveSections";
import { CTASection, PageHero } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { faqs } from "@/src/data/faqs";
import { faqJsonLd, pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP FAQ",
  description: "Answers to common questions about Bizovix ERP modules, implementation, pricing, training, and multi-branch readiness.",
  path: "/faq",
});

export default function FAQPage() {
  return (
    <>
      <SEOJsonLd data={faqJsonLd(faqs)} />
      <PageHero badge="FAQ" title="Frequently asked ERP questions" description="Practical answers for companies evaluating Bizovix." />
      <section className="section"><div className="container-shell"><FAQAccordion /></div></section>
      <CTASection />
    </>
  );
}
