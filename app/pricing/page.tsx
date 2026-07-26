import type { Metadata } from "next";
import { PricingToggle } from "@/components/sections/InteractiveSections";
import { CTASection } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Pricing",
  description:
    "Review Bizovix ERP pricing plans for growing businesses, multi-team operations, and production-focused companies across South Asia.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <section className="page-hero pricing-page-hero">
        <div className="container-shell">
          <div className="pricing-page-hero-inner">
            <p className="pricing-page-eyebrow">PRICING</p>
            <h1>Simple, Transparent ERP Pricing</h1>
            <p>
              Choose the plan that fits your business. Compare flexible monthly
              and annual options designed for growing companies across South Asia.
            </p>
          </div>
        </div>
      </section>

      <section className="pricing-plans-section section">
        <div className="container-shell">
          <PricingToggle />
        </div>
      </section>

      <CTASection title="Request a pricing conversation with real business context" />
    </>
  );
}
