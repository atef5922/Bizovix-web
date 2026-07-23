import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, CTASection, PageHero, SolutionPageContent, WorkflowBand } from "@/components/sections/MarketingSections";
import { DashboardShowcase } from "@/components/product/DashboardShowcase";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";
import { getSolution, solutions } from "@/src/data/solutions";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};
  return pageMetadata({ title: `${solution.title} Software`, description: solution.hero, path: `/solutions/${solution.slug}` });
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();
  const crumbs = [{ title: "Home", href: "/" }, { title: "Solutions", href: "/solutions" }, { title: solution.shortTitle, href: `/solutions/${solution.slug}` }];

  return (
    <>
      <SEOJsonLd data={breadcrumbJsonLd(crumbs.map((item) => ({ name: item.title, href: item.href })))} />
      <PageHero badge="Bizovix solution" title={solution.title} description={solution.description}>
        <Breadcrumbs items={crumbs} />
      </PageHero>
      <section className="section soft"><div className="container-shell"><DashboardShowcase compact /></div></section>
      <SolutionPageContent solution={solution} />
      <WorkflowBand />
      <CTASection title={`See how ${solution.shortTitle} fits your operation`} />
    </>
  );
}
