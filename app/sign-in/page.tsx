import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description: "Bizovix sign-in page prepared for future customer authentication.",
  path: "/sign-in",
});

export default function SignInPage() {
  return (
    <>
      <PageHero badge="Customer portal" title="Sign in to Bizovix" description="Customer authentication is prepared for the production application. For demo access, request a guided product walkthrough." />
      <section className="section"><div className="container-shell feature-list-panel"><h2>Demo access</h2><p>New users should request a demo so the correct workflow preview can be prepared.</p><Link className="nav-link active" href="/demo-request">Request Demo</Link></div></section>
    </>
  );
}
