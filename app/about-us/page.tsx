import type { Metadata } from "next";
import { CTASection, PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { company } from "@/src/data/company";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "Learn about Bizovix, a cloud ERP SaaS platform built for Bangladesh and ready for global business operations.",
  path: "/about-us",
});

export default function AboutPage() {
  return (
    <>
      <PageHero badge={company.positioning} title="ERP should make complex operations easier to see and manage" description={company.supportCopy} />
      <section className="section"><div className="container-shell"><SectionHeading title="What Bizovix stands for" /><div className="card-grid">{company.values.map((value) => <article className="feature-card" key={value}><h3>{value}</h3><p>We design ERP experiences around trust, clarity, practical adoption, and maintainable growth.</p></article>)}</div></div></section>
      <CTASection />
    </>
  );
}
