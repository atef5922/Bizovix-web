import type { Metadata } from "next";
import { CareerForm } from "@/components/forms/LeadForms";
import { PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Career",
  description: "Explore career interest at Bizovix and submit your profile for future ERP product, engineering, design, and implementation roles.",
  path: "/career",
});

export default function CareerPage() {
  return (
    <>
      <PageHero badge="Careers" title="Help build ERP software for ambitious operating teams" description="Bizovix is prepared for people who care about product craft, customer understanding, and practical business transformation." />
      <section className="section"><div className="container-shell two-column"><SectionHeading title="Share your profile" description="Use the career form to express interest in product, engineering, implementation, support, sales, or operations roles." /><CareerForm /></div></section>
    </>
  );
}
