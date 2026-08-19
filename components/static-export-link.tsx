"use client";

import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type StaticExportLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string; query?: Record<string, string | number | boolean> };
  children?: ReactNode;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  locale?: string | false;
};

function serializeHref(href: StaticExportLinkProps["href"]) {
  if (typeof href === "string") return href;

  const pathname = href.pathname ?? "/";
  const query = href.query ? new URLSearchParams(Object.entries(href.query).map(([key, value]) => [key, String(value)])) : null;
  return query?.size ? `${pathname}?${query.toString()}` : pathname;
}

/**
 * Static-export-only replacement for next/link.
 *
 * Shared hosting can serve exported HTML files but cannot answer Next's RSC
 * prefetch and client-navigation requests. A normal anchor preserves the exact
 * markup and styling while letting the server load the exported document.
 */
const StaticExportLink = forwardRef<HTMLAnchorElement, StaticExportLinkProps>(
  (props, ref) => {
    const anchorProps: Partial<StaticExportLinkProps> = { ...props };
    const href = serializeHref(props.href);
    delete anchorProps.href;
    delete anchorProps.prefetch;
    delete anchorProps.replace;
    delete anchorProps.scroll;
    delete anchorProps.shallow;
    delete anchorProps.locale;

    return <a ref={ref} href={href} {...(anchorProps as AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  },
);

StaticExportLink.displayName = "StaticExportLink";

export default StaticExportLink;
