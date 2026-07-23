import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, CTASection, PageHero } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { resources } from "@/src/data/resources";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);
  if (!resource) return {};
  return pageMetadata({ title: resource.title, description: resource.summary, path: `/resources/${resource.slug}` });
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);
  if (!resource) notFound();
  const crumbs = [{ title: "Home", href: "/" }, { title: "Resources", href: "/resources" }, { title: resource.title, href: `/resources/${resource.slug}` }];

  return (
    <>
      <SEOJsonLd data={breadcrumbJsonLd(crumbs.map((item) => ({ name: item.title, href: item.href })))} />
      <PageHero badge={resource.category} title={resource.title} description={resource.summary}>
        <Breadcrumbs items={crumbs} />
      </PageHero>
      <section className="section">
        <article className="container-shell article-body">
          <p><strong>Reading time:</strong> {resource.readingTime}</p>
          <h2>What this resource helps you clarify</h2>
          <p>Use this page to align leadership, finance, operations, warehouse, production, sales, and HR teams before a Bizovix demo. The goal is to identify workflows, reporting needs, approval paths, users, branches, and data migration scope early.</p>
          <h2>Related Bizovix areas</h2>
          <div className="button-row">
            {resource.related.map((item) => <Link className="nav-link active" href="/solutions" key={item}>{item}</Link>)}
          </div>
        </article>
      </section>
      <CTASection title="Bring your questions into a guided ERP demo" />
    </>
  );
}
