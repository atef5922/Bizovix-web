"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Download, Mail, MapPin, Menu, Phone, Search, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { BrandLockup } from "@/components/layout/BrandLockup";
import { industryNavigation, mainNavigation, resourcesNavigation, solutionNavigation } from "@/src/data/navigation";
import { siteConfig } from "@/src/config/site";
import { cn } from "@/src/lib/utils";
import type { IconName } from "@/src/types/site";

type MenuKey = "Industries" | "Solutions" | "Resources" | null;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState<MenuKey>(null);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    let animationFrame = 0;

    const updateScrolled = () => {
      const scrollY = window.scrollY;
      const nextScrolled = scrolledRef.current ? scrollY > 2 : scrollY > 56;

      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }

      animationFrame = 0;
    };

    const onScroll = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateScrolled);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(null);
        setDrawer(false);
        setSearch(false);
      }
    };
    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const searchItems = useMemo(
    () => [...solutionNavigation, ...industryNavigation, ...resourcesNavigation, { title: "Pricing", href: "/pricing", description: "Implementation-led ERP pricing paths." }],
    [],
  );

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={cn("site-header", scrolled && "is-scrolled")} onMouseLeave={() => setOpen(null)}>
        <div className="utility-bar">
          <div className="container-shell utility-inner">
            <a href={`tel:${siteConfig.salesPhone.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" />
              {siteConfig.salesPhone}
            </a>
            <a href={`mailto:${siteConfig.salesEmail}`}>
              <Mail className="h-4 w-4" />
              {siteConfig.salesEmail}
            </a>
            <span>
              <MapPin className="h-4 w-4" />
              {siteConfig.address}
            </span>
          </div>
        </div>
        <nav className="container-shell nav-shell" aria-label="Primary navigation">
          <BrandLockup />
          <div className="desktop-nav">
            {mainNavigation.map((item) => {
              const hasMenu = ["Industries", "Solutions", "Resources"].includes(item.title);
              const active = isNavActive(pathname, item);
              return hasMenu ? (
                <button
                  key={item.title}
                  className={cn("nav-link", active && "active")}
                  type="button"
                  aria-expanded={open === item.title}
                  onMouseEnter={() => setOpen(item.title as MenuKey)}
                  onFocus={() => setOpen(item.title as MenuKey)}
                  onClick={() => setOpen(open === item.title ? null : (item.title as MenuKey))}
                >
                  {item.title}<ChevronDown className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn("nav-link", active && "active")}
                  onMouseEnter={() => setOpen(null)}
                  onFocus={() => setOpen(null)}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
          <div className="nav-actions" onMouseEnter={() => setOpen(null)}>
            <button className="icon-button search-trigger" type="button" onClick={() => setSearch(true)} aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link className="signin-link" href="/sign-in">Sign In</Link>
            <ButtonLink
              className="nav-cta nav-download hidden sm:inline-flex"
              href={siteConfig.erpDownloadPath}
              download={siteConfig.erpDownloadFileName}
            >
              <Download className="nav-download-icon h-4 w-4" />
              <span>Download ERP</span>
            </ButtonLink>
            <button className="icon-button mobile-menu-trigger" type="button" onClick={() => setDrawer(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
        {open && <MegaMenu type={open} pathname={pathname} onClose={() => setOpen(null)} />}
      </header>
      {drawer && <MobileDrawer pathname={pathname} onClose={() => setDrawer(false)} onSearch={() => setSearch(true)} />}
      {search && <SearchDialog items={searchItems} onClose={() => setSearch(false)} />}
    </>
  );
}

function MegaMenu({ type, pathname, onClose }: { type: Exclude<MenuKey, null>; pathname: string; onClose: () => void }) {
  const items = type === "Industries" ? industryNavigation : type === "Solutions" ? solutionNavigation : resourcesNavigation;
  const grouped = type === "Resources" ? groupResourceItems(resourcesNavigation) : groupItems(items);
  const featureImage =
    type === "Industries"
      ? {
          src: "/images/submenu/ERP%20for%20Manufacturing.webp",
          alt: "Bizovix manufacturing ERP workflow preview",
        }
      : type === "Solutions"
        ? {
            src: "/images/submenu/Connected%20ERP%20Modules.webp",
            alt: "Bizovix connected ERP modules preview",
          }
        : null;

  return (
    <div className="mega-wrap" onMouseLeave={onClose}>
      <div className={cn("mega-menu container-shell", type === "Resources" && "compact")}>
        <div className="mega-groups">
          {Object.entries(grouped).map(([group, groupItemsList]) => (
            <div key={group}>
              <p className="mega-label">{group}</p>
              <div className="mega-list">
                {groupItemsList.map((item) => (
                  <Link key={item.href} className={cn("mega-item", isPathActive(pathname, item.href) && "active")} href={item.href} onClick={onClose}>
                    {item.icon && <span><Icon name={item.icon} className="h-5 w-5" /></span>}
                    <span><strong>{item.title}</strong><small>{item.description}</small></span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        {type !== "Resources" && (
          <div className="mega-feature">
            {featureImage && (
              // Static public asset avoids Vinext image optimization runtime issues in the menu.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featureImage.src}
                alt={featureImage.alt}
                width="520"
                height="300"
                className="mega-feature-visual"
              />
            )}
            <p>{type === "Industries" ? "ERP for Manufacturing" : "Connected ERP Modules"}</p>
            <h2>{type === "Industries" ? "Plan production, materials, work orders, and costs." : "One platform for the full operating workflow."}</h2>
            {type === "Industries" ? (
              <Link href="/industries/manufacturing" onClick={onClose}>
                Explore Manufacturing ERP
              </Link>
            ) : (
              <a
                href={siteConfig.erpDownloadPath}
                download={siteConfig.erpDownloadFileName}
                onClick={onClose}
              >
                Download ERP Software
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MobileDrawer({ pathname, onClose, onSearch }: { pathname: string; onClose: () => void; onSearch: () => void }) {
  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="drawer-panel">
        <div className="drawer-head">
          <BrandLockup compact />
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>
        <button className="drawer-search" type="button" onClick={onSearch}><Search className="h-5 w-5" /> Search Bizovix</button>
        <div className="drawer-links">
          {mainNavigation.map((item) => (
            <Link key={item.href} onClick={onClose} className={cn(isNavActive(pathname, item) && "active")} href={item.href}>{item.title}</Link>
          ))}
        </div>
        <DrawerGroup title="Solutions" pathname={pathname} items={solutionNavigation} onClose={onClose} />
        <DrawerGroup title="Industries" pathname={pathname} items={industryNavigation} onClose={onClose} />
        <DrawerGroup title="Resources" pathname={pathname} items={resourcesNavigation} onClose={onClose} />
        <div className="drawer-actions">
          <ButtonLink
            className="nav-download"
            href={siteConfig.erpDownloadPath}
            download={siteConfig.erpDownloadFileName}
          >
            <Download className="nav-download-icon h-4 w-4" />
            <span>Download ERP</span>
          </ButtonLink>
          <ButtonLink href="/sign-in" variant="secondary">Sign In</ButtonLink>
        </div>
      </div>
    </div>
  );
}

function DrawerGroup({ title, pathname, items, onClose }: { title: string; pathname: string; items: Array<{ title: string; href: string; icon?: IconName }>; onClose: () => void }) {
  return (
    <details className="drawer-group">
      <summary>{title}<ChevronDown className="h-4 w-4" /></summary>
      <div>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={cn(isPathActive(pathname, item.href) && "active")} onClick={onClose}>
            {item.icon && <Icon name={item.icon} className="h-4 w-4" />}
            {item.title}
          </Link>
        ))}
      </div>
    </details>
  );
}

function SearchDialog({ items, onClose }: { items: Array<{ title: string; href: string; description?: string }>; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-dialog">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-[var(--primary)]" />
          <input autoFocus aria-label="Search Bizovix" placeholder="Search solutions, industries, resources" value={query} onChange={(event) => setQuery(event.target.value)} />
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close search"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 grid gap-2">
          {filtered.length ? filtered.map((item) => (
            <Link className="search-result" key={item.href} href={item.href} onClick={onClose}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </Link>
          )) : <p className="empty-state">No matching result yet. Try inventory, manufacturing, POS, or pricing.</p>}
        </div>
      </div>
    </div>
  );
}

function groupItems<T extends { group?: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const group = item.group || "Resources";
    acc[group] = [...(acc[group] || []), item];
    return acc;
  }, {});
}

function groupResourceItems(items: typeof resourcesNavigation) {
  return items.reduce<Record<string, typeof resourcesNavigation>>((acc, item) => {
    const group = ["About Us", "Career", "Contact"].includes(item.title) ? "Company" : "Knowledge";
    acc[group] = [...(acc[group] || []), item];
    return acc;
  }, {});
}

function isPathActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavActive(pathname: string, item: { title: string; href: string }) {
  if (isPathActive(pathname, item.href)) {
    return true;
  }

  const groupItems =
    item.title === "Industries" ? industryNavigation :
    item.title === "Solutions" ? solutionNavigation :
    item.title === "Resources" ? resourcesNavigation :
    [];

  return groupItems.some((groupItem) => isPathActive(pathname, groupItem.href));
}
