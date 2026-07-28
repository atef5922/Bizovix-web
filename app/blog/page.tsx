import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MessageCircle, UserRound } from "lucide-react";
import { CTASection } from "@/components/sections/MarketingSections";
import { blogPosts } from "@/src/data/blog";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "ERP Blog",
  description:
    "Read Bizovix ERP blog articles about ERP software in Bangladesh, cloud ERP, manufacturing, inventory, accounting, POS, HR payroll, implementation, dashboards, and business automation.",
  path: "/blog",
});

export default function BlogPage() {
  const [featuredPost, ...posts] = blogPosts;
  const fallbackImage = "/images/blog/ERP%20Guide.webp";

  return (
    <>
      <section className="blog-hero">
        <div className="container-shell blog-hero-inner">
          <p className="blog-hero-badge">Bizovix Blog</p>
          <h1>
            <span className="title-accent">ERP insights</span> for growing businesses
          </h1>
        </div>
      </section>

      <section className="blog-listing-section">
        <div className="container-shell">
          <article className="blog-featured-card">
            <div className="blog-featured-media">
              <img src={featuredPost.image ?? fallbackImage} alt={featuredPost.title} />
            </div>
            <div className="blog-featured-copy">
              <span className="blog-card-category">{featuredPost.category}</span>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.excerpt}</p>
              <div className="blog-card-meta">
                <span><CalendarDays className="h-4 w-4" />{formatDate(featuredPost.updated)}</span>
                <span><UserRound className="h-4 w-4" />{featuredPost.author}</span>
                <span><MessageCircle className="h-4 w-4" />ERP insights</span>
              </div>
              <Link className="blog-read-link" href={`/blog/${featuredPost.slug}`}>
                Read featured article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <div className="blog-section-heading">
            <p className="blog-hero-badge">Latest Articles</p>
            <h2>
              Explore practical <span className="title-accent">ERP knowledge</span> by workflow
            </h2>
            <p>
              Browse guidance for finance, inventory, manufacturing, retail POS,
              distribution, HR payroll, dashboards, security, and implementation planning.
            </p>
          </div>

          <div className="blog-card-grid">
            {posts.map((post) => (
              <article className="blog-card" key={post.slug}>
                <Link className="blog-card-media" href={`/blog/${post.slug}`}>
                  <img src={post.image ?? fallbackImage} alt={post.title} />
                  <span>{formatDate(post.updated)}</span>
                </Link>
                <div className="blog-card-body">
                  <span className="blog-card-category">{post.category}</span>
                  <h3>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p>{post.excerpt}</p>
                  <div className="blog-card-meta">
                    <span><UserRound className="h-4 w-4" />Bizovix Team</span>
                    <span><MessageCircle className="h-4 w-4" />{post.readingTime}</span>
                  </div>
                  <Link className="blog-read-link compact" href={`/blog/${post.slug}`}>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
