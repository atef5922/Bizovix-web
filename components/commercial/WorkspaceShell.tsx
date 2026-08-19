"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, ArrowUpRight, BarChart3, Bell, Building2, ChevronDown, CircleDollarSign,
  CreditCard, Download, FileText, Gauge, KeyRound, Laptop, LifeBuoy,
  LayoutDashboard, Loader2, LogOut, Menu, PackageOpen, Search, ShieldCheck,
  Sparkles, Users, X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { WorkspaceToastProvider } from "./WorkspaceToast";

export type WorkspaceKind = "admin" | "account";

export type WorkspaceNotification = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "warn" | "danger" | "info";
};

export type WorkspaceUser = {
  name: string;
  email: string;
  initials: string;
  roleLabel: string;
};

type SearchHit = { id: string; label: string; sublabel: string; href: string; group: string };

const adminGroups = [
  { label: "Overview", items: [["Dashboard", "/admin", LayoutDashboard]] },
  { label: "Customers", items: [["Companies", "/admin/companies", Building2], ["Customer users", "/admin/users", Users], ["Devices", "/admin/devices", Laptop]] },
  { label: "Sales & billing", items: [["Subscriptions", "/admin/subscriptions", CreditCard], ["Payments", "/admin/payments", CircleDollarSign], ["Renewals", "/admin/renewals", Activity], ["Invoices", "/admin/invoices", FileText]] },
  { label: "Licensing", items: [["Licenses", "/admin/licenses", KeyRound], ["Generate license", "/admin/licenses/new", Sparkles], ["Activations", "/admin/activations", ShieldCheck]] },
  { label: "Products & insight", items: [["Plans & features", "/admin/plans", PackageOpen], ["Analytics", "/admin/analytics", BarChart3], ["Downloads", "/admin/downloads", Download], ["Activity logs", "/admin/activity", Gauge]] },
] as const;

const accountGroups = [
  { label: "My Bizovix", items: [["Overview", "/account", LayoutDashboard], ["Subscription", "/account/subscription", CreditCard], ["License", "/account/license", KeyRound], ["Devices", "/account/devices", Laptop], ["Billing", "/account/billing", CircleDollarSign], ["Invoices & receipts", "/account/invoices", FileText], ["Download", "/account/download", Download]] },
] as const;

export function WorkspaceShell({
  kind,
  user,
  notifications,
  signOutAction,
  children,
}: {
  kind: WorkspaceKind;
  user: WorkspaceUser;
  notifications: WorkspaceNotification[];
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = kind === "admin" ? adminGroups : accountGroups;
  const title = kind === "admin" ? "Control Center" : "Customer Portal";

  return (
    <WorkspaceToastProvider>
      <div className={`workspace workspace-${kind}`}>
        <aside className={`workspace-sidebar ${mobileOpen ? "is-open" : ""}`}>
          <div className="workspace-brand">
            <Link href={`/${kind}`} className="workspace-brand-link" aria-label={`Bizovix ${title} home`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/bizovix-logo-nav.png" alt="Bizovix" />
            </Link>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
          </div>
          <div className="workspace-product"><span>{kind === "admin" ? "B" : "A"}</span><div><strong>{title}</strong><small>{kind === "admin" ? "Commercial operations" : "Manage your workspace"}</small></div></div>
          <nav aria-label={`${title} navigation`}>
            {groups.map((group) => <div className="workspace-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([label, href, Icon]) => {
                const active = href === `/${kind}` ? pathname === href : pathname.startsWith(href);
                return <Link key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)}><Icon />{label}</Link>;
              })}
            </div>)}
          </nav>
          <div className="workspace-sidebar-foot"><Link href="/"><ArrowUpRight /> Back to website</Link></div>
        </aside>

        {mobileOpen && <button className="workspace-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}

        <div className="workspace-main">
          <header className="workspace-topbar">
            <button className="workspace-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
            <GlobalSearch kind={kind} />
            <div className="workspace-top-actions">
              <Link href="/help-center" aria-label="Help center" title="Help center" className="topbar-icon-link"><LifeBuoy /></Link>
              <NotificationsMenu notifications={notifications} />
              <UserMenu user={user} signOutAction={signOutAction} />
            </div>
          </header>
          <div className="workspace-content">{children}</div>
        </div>
      </div>
    </WorkspaceToastProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Global search                                                               */
/* -------------------------------------------------------------------------- */

function GlobalSearch({ kind }: { kind: WorkspaceKind }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const listId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onClickAway(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const query = term.trim();
  // Derived rather than cleared via setState, so a too-short query needs no
  // synchronous state update inside the effect.
  const visibleHits = query.length >= 2 ? hits : [];

  useEffect(() => {
    if (kind !== "admin" || query.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("search failed");
        const data = (await response.json()) as { hits: SearchHit[] };
        setHits(data.hits);
        setOpen(true);
      } catch (error) {
        // An aborted request is the expected outcome of typing another key.
        if ((error as Error).name !== "AbortError") setHits([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, kind]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setTerm("");
      router.push(href);
    },
    [router],
  );

  return (
    <div className="workspace-search-wrap" ref={containerRef}>
      <div className="workspace-search">
        <Search />
        <input
          ref={inputRef}
          value={term}
          // combobox (not the implicit textbox role) is what makes
          // aria-expanded/aria-controls valid for a search-with-listbox.
          role="combobox"
          aria-haspopup="listbox"
          onChange={(event) => setTerm(event.target.value)}
          onFocus={() => visibleHits.length > 0 && setOpen(true)}
          aria-label="Search"
          aria-controls={listId}
          aria-expanded={open}
          placeholder={kind === "admin" ? "Search companies, licenses, payments..." : "Search your account..."}
        />
        {loading ? <Loader2 className="spin search-spinner" /> : <kbd>⌘ K</kbd>}
      </div>

      {open && kind === "admin" && query.length >= 2 ? (
        <div className="search-results" id={listId} role="listbox">
          {visibleHits.length === 0 && !loading ? (
            <p className="search-empty">No matches for “{term}”.</p>
          ) : (
            visibleHits.map((hit) => (
              <button key={`${hit.group}-${hit.id}`} type="button" role="option" aria-selected={false} onClick={() => go(hit.href)}>
                <span className="search-group">{hit.group}</span>
                <span className="search-label">{hit.label}</span>
                <span className="search-sub">{hit.sublabel}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

function NotificationsMenu({ notifications }: { notifications: WorkspaceNotification[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  return (
    <div className="topbar-menu" ref={ref}>
      <button
        type="button"
        aria-label={`Notifications (${notifications.length})`}
        aria-expanded={open}
        className="notification"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell />
        {notifications.length > 0 ? <i /> : null}
      </button>

      {open ? (
        <div className="topbar-dropdown notifications-dropdown">
          <div className="dropdown-head">
            <strong>Notifications</strong>
            <span>{notifications.length} needing attention</span>
          </div>
          {notifications.length === 0 ? (
            <p className="dropdown-empty">Nothing needs attention right now.</p>
          ) : (
            <ul>
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    <i className={`dot tone-${item.tone}`} />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* User menu                                                                   */
/* -------------------------------------------------------------------------- */

function UserMenu({
  user,
  signOutAction,
}: {
  user: WorkspaceUser;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  return (
    <div className="topbar-menu" ref={ref}>
      <button
        type="button"
        className="workspace-user"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{user.initials}</span>
        <div>
          <strong>{user.name}</strong>
          <small>{user.roleLabel}</small>
        </div>
        <ChevronDown />
      </button>

      {open ? (
        <div className="topbar-dropdown user-dropdown">
          <div className="dropdown-head">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="dropdown-signout">
              <LogOut /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
