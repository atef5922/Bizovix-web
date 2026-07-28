import type { Metadata } from "next";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "Review how Bizovix prepares to handle business inquiry data, software download support information, contact details, and future ERP customer privacy requirements responsibly.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" intro="Bizovix is prepared to handle business inquiry data responsibly. This page should be reviewed by qualified counsel before production legal use." items={["Download and contact forms collect business contact details, company context, preferred communication method, and selected ERP requirements.", "Information submitted through the website is intended for sales, support, implementation planning, and customer communication.", "Future backend integrations should document storage location, retention period, access control, user rights, analytics usage, and third-party processors clearly.", "ERP product data, if connected in production, should be protected with role-based access, secure authentication, operational auditability, and responsible retention policies."]} />;
}

function PolicyPage({ title, intro, items }: { title: string; intro: string; items: string[] }) {
  return (
    <>
      <PageHero badge="Legal" title={title} description={intro} />
      <section className="section"><div className="container-shell article-body"><h2>Key points</h2>{items.map((item) => <p key={item}>{item}</p>)}</div></section>
    </>
  );
}
