import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, CTASection, IndustryPageContent, PageHero, WorkflowBand } from "@/components/sections/MarketingSections";
import { DashboardShowcase } from "@/components/product/DashboardShowcase";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";
import { getIndustry, industries } from "@/src/data/industries";

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return pageMetadata({ title: `ERP for ${industry.title}`, description: industry.description, path: `/industries/${industry.slug}` });
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  const crumbs = [{ title: "Home", href: "/" }, { title: "Industries", href: "/industries" }, { title: industry.title, href: `/industries/${industry.slug}` }];

  return (
    <>
      <SEOJsonLd data={breadcrumbJsonLd(crumbs.map((item) => ({ name: item.title, href: item.href })))} />
      <PageHero badge="Industry ERP" title={`ERP for ${industry.title}`} description={industry.description}>
        <Breadcrumbs items={crumbs} />
      </PageHero>
      <section className="section soft"><div className="container-shell"><DashboardShowcase compact /></div></section>
      <IndustryPageContent industry={industry} />
      <WorkflowBand />
      <CTASection title={`Plan a Bizovix demo for ${industry.title}`} />
    </>
  );
}
