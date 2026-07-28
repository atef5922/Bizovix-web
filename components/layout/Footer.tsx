import Link from "next/link";
import { resourcesNavigation, solutionNavigation, industryNavigation } from "@/src/data/navigation";
import { siteConfig } from "@/src/config/site";
import { NewsletterForm } from "@/components/forms/LeadForms";
import { BrandLockup } from "@/components/layout/BrandLockup";

export function Footer() {
  const industries = industryNavigation.slice(0, 6);
  const solutions = [{ title: "All Solutions", href: "/solutions" }, ...solutionNavigation.slice(0, 8)];

  return (
    <footer className="site-footer">
      <div className="container-shell footer-shell">
        <div className="footer-top">
          <div className="footer-brand-panel">
            <BrandLockup variant="light" className="footer-logo" />
            <p>
              Bizovix connects finance, inventory, purchase, manufacturing, sales, POS, HR, payroll, approvals, and reporting in one secure operating platform.
            </p>
            <div className="footer-contact-list">
              <a href={`mailto:${siteConfig.salesEmail}`}>{siteConfig.salesEmail}</a>
              <a href={`tel:${siteConfig.salesPhone.replace(/\s/g, "")}`}>{siteConfig.salesPhone}</a>
              <span>Dhaka, Bangladesh</span>
            </div>
            <div className="footer-proof-row" aria-label="Bizovix platform highlights">
              <span>Cloud ERP</span>
              <span>BD-ready</span>
              <span>Secure rollout</span>
            </div>
          </div>

          <div className="footer-link-grid">
            <FooterColumn title="Solutions" items={solutions} />
            <FooterColumn title="Industries" items={industries} />
            <FooterColumn title="Company" items={resourcesNavigation} />
            <div className="footer-newsletter">
              <h2>Updates</h2>
              <p>Get ERP implementation ideas, product notes, and workflow planning resources.</p>
              <div>
                <NewsletterForm compact />
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Copyright {new Date().getFullYear()} Bizovix. All rights reserved.</p>
          <div>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: Array<{ title: string; href: string }> }) {
  return (
    <div className="footer-column">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
