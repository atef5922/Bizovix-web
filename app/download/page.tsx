import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero, SectionHeading } from "@/components/sections/MarketingSections";
import { siteConfig } from "@/src/config/site";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Download Bizovix ERP Software",
  description:
    "Download the Bizovix ERP software installer for connected accounting, inventory, purchase, manufacturing, sales, POS, HR, payroll, approvals, and reporting workflows.",
  path: "/download",
});

const downloadSteps = [
  ["01", "Download installer", "Get the latest Bizovix ERP setup file directly from the official website."],
  ["02", "Install securely", "Run the installer on your Windows device and follow the setup instructions."],
  ["03", "Start ERP workspace", "Open Bizovix ERP and continue with your configured business workspace."],
];

export default function DownloadPage() {
  return (
    <>
      <PageHero
        badge="ERP Software"
        title={<>Download <span className="title-accent">Bizovix ERP Software</span></>}
        description="Install the Bizovix ERP workspace for connected finance, inventory, sales, purchase, production, HR, payroll, approvals, and reporting."
      >
        <div className="button-row">
          <ButtonLink
            href={siteConfig.erpDownloadPath}
            download={siteConfig.erpDownloadFileName}
          >
            Download ERP Software <Download className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/solutions" variant="secondary">
            View ERP Modules <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-shell two-column download-layout">
          <div>
            <SectionHeading
              title={<>Install Bizovix ERP in <span className="title-accent">three simple steps</span></>}
              description="Use the official installer to set up the Bizovix ERP software on your device."
            />
            <div className="process-mini-list">
              {downloadSteps.map(([step, title, body]) => (
                <article key={step}>
                  <span>{step}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="feature-list-panel">
            <h3>Included ERP areas</h3>
            <ul>
              {[
                "Accounting, purchase, inventory, and warehouse control",
                "Manufacturing, sales, POS, HR, payroll, and approvals",
                "Dashboards, reporting, and connected department workflows",
              ].map((item) => (
                <li key={item}><CheckCircle2 className="h-5 w-5" />{item}</li>
              ))}
            </ul>
            <ButtonLink
              href={siteConfig.erpDownloadPath}
              download={siteConfig.erpDownloadFileName}
            >
              Download {siteConfig.erpDownloadFileName}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
