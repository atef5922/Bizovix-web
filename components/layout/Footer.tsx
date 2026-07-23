import Link from "next/link";
import { resourcesNavigation, solutionNavigation, industryNavigation } from "@/src/data/navigation";
import { siteConfig } from "@/src/config/site";
import { NewsletterForm } from "@/components/forms/LeadForms";
import { BrandLockup } from "@/components/layout/BrandLockup";

export function Footer() {
  const industries = industryNavigation.slice(0, 6);
  const solutions = solutionNavigation.slice(0, 8);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--navy)] text-white">
      <div className="container-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <BrandLockup variant="light" />
            <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
              Cloud ERP for Bangladesh and beyond, connecting accounting, inventory, purchase, manufacturing, sales, POS, HR, payroll, and reporting.
            </p>
            <div className="mt-6 text-sm text-white/72">
              <p>{siteConfig.salesEmail}</p>
              <p>{siteConfig.salesPhone}</p>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn title="Solutions" items={solutions} />
            <FooterColumn title="Industries" items={industries} />
            <FooterColumn title="Company" items={resourcesNavigation} />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/58">Updates</h2>
              <p className="mt-4 text-sm leading-6 text-white/72">Get ERP implementation ideas and product notes.</p>
              <div className="mt-4">
                <NewsletterForm compact />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/12 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Bizovix. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
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
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/58">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-white/72">
        {items.map((item) => (
          <li key={item.href}>
            <Link className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href={item.href}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
