import type { Metadata } from "next";
import { PageHero } from "@/components/sections/MarketingSections";
import { siteConfig } from "@/src/config/site";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description: "Bizovix customer portal sign-in page for future ERP access and secure business workflow previews.",
  path: "/sign-in",
});

export default function SignInPage() {
  return (
    <>
      <PageHero
        badge="Customer portal"
        title={<>Sign in to <span className="title-accent">Bizovix</span></>}
        description="Customer authentication is prepared for the production application. Download the ERP software to access the prepared workspace."
      />
      <section className="section">
        <div className="container-shell two-column">
          <div className="feature-list-panel">
            <h2>ERP software access</h2>
            <p>New users can download the Bizovix ERP software and continue with their configured industry, modules, and reporting workspace.</p>
            <a className="nav-link active" href={siteConfig.erpDownloadPath} download={siteConfig.erpDownloadFileName}>Download ERP</a>
          </div>
          <div className="portal-preview-card">
            <span>Prepared portal areas</span>
            <strong>Dashboard</strong>
            <strong>Approvals</strong>
            <strong>Reports</strong>
            <strong>Support</strong>
          </div>
        </div>
      </section>
    </>
  );
}
