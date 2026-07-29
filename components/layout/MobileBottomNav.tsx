"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BriefcaseBusiness, Factory, Home, MessageCircle, Tags } from "lucide-react";
import { cn } from "@/src/lib/utils";

const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Solutions", href: "/solutions", icon: BriefcaseBusiness },
  { label: "Industries", href: "/industries", icon: Factory },
  { label: "Pricing", href: "/pricing", icon: Tags },
  { label: "Contact", href: "/contact", icon: MessageCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const updateEnabled = () => setEnabled(mediaQuery.matches);

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;

      setVisible(!scrollingDown || currentScrollY < 80);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const previousPadding = document.body.style.paddingBottom;

    if (enabled) {
      document.body.style.paddingBottom = "calc(70px + env(safe-area-inset-bottom))";
    } else {
      document.body.style.paddingBottom = previousPadding;
    }

    return () => {
      document.body.style.paddingBottom = previousPadding;
    };
  }, [enabled]);

  const navStyle = useMemo<CSSProperties>(
    () => ({
      position: "fixed",
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 80,
      display: "grid",
      gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
      minHeight: "calc(62px + env(safe-area-inset-bottom))",
      borderTop: "1px solid rgba(200, 214, 232, 0.92)",
      background: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 -14px 30px rgba(15, 39, 84, 0.12)",
      padding: "6px max(10px, env(safe-area-inset-left)) calc(6px + env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-right))",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      transform: visible ? "translateY(0)" : "translateY(110%)",
      transition: "transform 220ms ease, opacity 220ms ease",
      backdropFilter: "blur(14px)",
    }),
    [visible],
  );

  if (!enabled) {
    return null;
  }

  return (
    <nav
      className={cn("mobile-bottom-nav", !visible && "is-hidden")}
      aria-label="Mobile bottom navigation"
      style={navStyle}
    >
      {bottomNavItems.map(({ label, href, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            className={cn("mobile-bottom-nav-link", active && "is-active")}
            href={href}
            key={href}
            style={{
              position: "relative",
              display: "grid",
              minWidth: 0,
              placeItems: "center",
              gap: 3,
              color: active ? "#0764ee" : "#536179",
              fontSize: 10,
              fontWeight: 800,
              lineHeight: 1,
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -6,
                left: "50%",
                width: 26,
                height: 3,
                borderRadius: 999,
                background: active ? "#13b7d8" : "transparent",
                transform: "translateX(-50%)",
              }}
            />
            <Icon className="h-5 w-5" size={20} strokeWidth={2.25} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
