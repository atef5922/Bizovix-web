import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, Layers3, UserRound } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { blogPosts, getBlogPost } from "@/src/data/blog";
import { breadcrumbJsonLd, pageMetadata } from "@/src/lib/seo";
import { absoluteUrl } from "@/src/lib/utils";

const fallbackImage = "/images/blog/ERP%20Guide.webp";

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

  const postImage = post.image ?? fallbackImage;
  const crumbs = [{ title: "Home", href: "/" }, { title: "Blog", href: "/blog" }, { title: post.title, href: `/blog/${post.slug}` }];
  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(postImage),
    datePublished: post.updated,
    dateModified: post.updated,
    author: { "@type": "Organization", name: post.author },
    editor: post.reviewer,
    articleSection: post.category,
    keywords: [
      post.category,
      "ERP software Bangladesh",
      "Bizovix ERP",
      "cloud ERP",
      "business automation",
    ],
    wordCount: post.sections.reduce((total, section) => total + section.heading.split(/\s+/).length + section.body.split(/\s+/).length, 0),
    publisher: {
      "@type": "Organization",
      name: "Bizovix",
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/bizovix-logo-nav.png") },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <>
      <SEOJsonLd data={breadcrumbJsonLd(crumbs.map((item) => ({ name: item.title, href: item.href })))} />
      <SEOJsonLd data={articleJsonLd} />

      <section className="blog-detail-hero">
        <div className="container-shell blog-detail-hero-grid">
          <div className="blog-detail-hero-copy">
            <div className="blog-detail-topline">
              <Link className="blog-back-link" href="/blog">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
              <p className="blog-hero-badge blog-detail-badge">{post.category}</p>
            </div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <div className="blog-detail-meta">
              <span><UserRound className="h-4 w-4" />{post.author}</span>
              <span><CalendarDays className="h-4 w-4" />{formatDate(post.updated)}</span>
              <span><Clock3 className="h-4 w-4" />{post.readingTime}</span>
            </div>
          </div>
          <div className="blog-detail-hero-media">
            <img src={postImage} alt={post.title} />
          </div>
        </div>
      </section>

      <section className="blog-detail-section">
        <div className="container-shell blog-detail-layout">
          <aside className="blog-detail-sidebar">
            <div className="blog-toc-card">
              <span><Layers3 className="h-4 w-4" />Article Guide</span>
              {post.sections.map((section) => (
                <Link key={section.heading} href={`#${anchorId(section.heading)}`}>{section.heading}</Link>
              ))}
            </div>
            <div className="blog-author-card">
              <p>Reviewed by</p>
              <strong>{post.reviewer}</strong>
              <span>Bizovix ERP content is written for practical business planning, implementation readiness, and connected operations.</span>
            </div>
          </aside>

          <article className="blog-detail-article">
            <p className="blog-lead">{post.excerpt}</p>
            {post.sections.map((section, index) => (
              <section className="blog-article-block" id={anchorId(section.heading)} key={section.heading}>
                <div className="blog-article-heading-row">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{section.heading}</h2>
                </div>
                <p>{section.body}</p>
                <div className="blog-insight-box">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>Bizovix connects this workflow with finance, inventory, approvals, reports, and team accountability so decisions can move from scattered updates to one reliable operating view.</p>
                </div>
              </section>
            ))}

            <div className="blog-action-panel">
              <div>
                <span>Next step</span>
                <h2>Map this topic to your actual ERP workflow</h2>
                <p>Review modules, users, branches, approvals, migration needs, and reporting priorities with the Bizovix team.</p>
              </div>
              <Link href="/demo-request">
                Request Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="blog-related-section">
        <div className="container-shell">
          <div className="blog-section-heading">
            <p className="blog-hero-badge">Related Reading</p>
            <h2>Continue exploring connected ERP workflows</h2>
          </div>
          <div className="blog-card-grid">
            {relatedPosts.map((item) => (
              <article className="blog-card" key={item.slug}>
                <Link className="blog-card-media" href={`/blog/${item.slug}`}>
                  <img src={item.image ?? fallbackImage} alt={item.title} />
                  <span>{formatDate(item.updated)}</span>
                </Link>
                <div className="blog-card-body">
                  <span className="blog-card-category">{item.category}</span>
                  <h3><Link href={`/blog/${item.slug}`}>{item.title}</Link></h3>
                  <p>{item.excerpt}</p>
                  <Link className="blog-read-link compact" href={`/blog/${item.slug}`}>
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Turn ERP research into a practical product demo" />
    </>
  );
}

function anchorId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
