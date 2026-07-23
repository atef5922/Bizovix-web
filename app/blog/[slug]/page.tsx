import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, CTASection, PageHero } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { blogPosts, getBlogPost } from "@/src/data/blog";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}` });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const crumbs = [{ title: "Home", href: "/" }, { title: "Blog", href: "/blog" }, { title: post.title, href: `/blog/${post.slug}` }];

  return (
    <>
      <SEOJsonLd data={breadcrumbJsonLd(crumbs.map((item) => ({ name: item.title, href: item.href })))} />
      <PageHero badge={post.category} title={post.title} description={post.excerpt}>
        <Breadcrumbs items={crumbs} />
      </PageHero>
      <section className="section">
        <article className="container-shell article-body">
          <p><strong>Author:</strong> {post.author} &nbsp; <strong>Reviewer:</strong> {post.reviewer}</p>
          <p><strong>Updated:</strong> {post.updated} &nbsp; <strong>Reading time:</strong> {post.readingTime}</p>
          <nav aria-label="Table of contents" className="feature-list-panel">
            <h2>Table of contents</h2>
            {post.sections.map((section) => <Link key={section.heading} href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{section.heading}</Link>)}
          </nav>
          {post.sections.map((section) => (
            <section key={section.heading} id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <div className="feature-list-panel">
            <h2>Related ERP paths</h2>
            <p>Continue with solution and industry pages that connect this topic to real Bizovix workflows.</p>
            <div className="button-row">
              <Link className="nav-link active" href="/solutions/manufacturing">Manufacturing ERP</Link>
              <Link className="nav-link active" href="/solutions/inventory">Inventory ERP</Link>
              <Link className="nav-link active" href="/industries/manufacturing">Manufacturing Industry</Link>
            </div>
          </div>
        </article>
      </section>
      <CTASection title="Turn ERP research into a practical product demo" />
    </>
  );
}
