"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Loader2, Rocket, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { siteConfig } from "@/src/config/site";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "dark";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(buttonClasses(variant), className)} {...props} />;
}

const LOADING_DURATION_MS = 1400;
const MESSAGE_DURATION_MS = 4500;

type NoticePhase = "idle" | "loading" | "message";

/**
 * A small dismissing card used wherever a disabled download CTA is clicked.
 * Shows a brief loading state first, then the actual message. Portaled to
 * document.body: several of these buttons live inside the Swiper hero
 * carousel, and Swiper puts a CSS transform on its slide track — any
 * `position: fixed` descendant of a transformed ancestor stops being fixed to
 * the viewport and becomes fixed to that ancestor instead. Rendering outside
 * the tree entirely is what makes "always top-right of the screen" reliable.
 */
export function DownloadUnavailableNotice({ phase, onClose }: { phase: NoticePhase; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (phase === "idle" || !mounted) return null;

  return createPortal(
    <span role="status" className="download-unavailable-tip">
      {phase === "loading" ? (
        <>
          <span className="dl-tip-icon dl-tip-icon-loading">
            <Loader2 />
          </span>
          <strong>Preparing your download…</strong>
        </>
      ) : (
        <>
          <span className="dl-tip-icon">
            <Rocket />
          </span>
          <strong>{siteConfig.erpDownloadUnavailableMessage}</strong>
          <button type="button" className="dl-tip-close" onClick={onClose} aria-label="Dismiss">
            <X />
          </button>
        </>
      )}
    </span>,
    document.body,
  );
}

export function useDownloadUnavailableNotice() {
  const [phase, setPhase] = useState<NoticePhase>("idle");
  const timeoutRef = useRef<number | null>(null);
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (phase === "idle") return;
    function onOutsideClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) hide();
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [phase]);

  function notify() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setPhase("loading");
    timeoutRef.current = window.setTimeout(() => {
      setPhase("message");
      timeoutRef.current = window.setTimeout(() => setPhase("idle"), MESSAGE_DURATION_MS);
    }, LOADING_DURATION_MS);
  }

  function hide() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setPhase("idle");
  }

  return { phase, notify, hide, wrapRef };
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  download,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
  download?: boolean | string;
}) {
  const { phase, notify, hide, wrapRef } = useDownloadUnavailableNotice();

  if (download) {
    if (!siteConfig.erpDownloadEnabled) {
      return (
        <span className="download-unavailable-wrap" ref={wrapRef}>
          <button type="button" className={cn(buttonClasses(variant), className)} onClick={notify}>
            {children}
          </button>
          <DownloadUnavailableNotice phase={phase} onClose={hide} />
        </span>
      );
    }

    return (
      <a className={cn(buttonClasses(variant), className)} href={href} download={download}>
        {children}
      </a>
    );
  }

  return (
    <Link className={cn(buttonClasses(variant), className)} href={href}>
      {children}
    </Link>
  );
}

/**
 * A raw, unstyled-by-us download link — for spots that apply their own custom
 * class (e.g. "erp-primary-link") instead of the standard button variants.
 * Same disabled-notice behavior as ButtonLink, just without buttonClasses().
 */
export function DownloadLink({ className, children }: { className?: string; children: ReactNode }) {
  const { phase, notify, hide, wrapRef } = useDownloadUnavailableNotice();

  if (!siteConfig.erpDownloadEnabled) {
    return (
      <span className="download-unavailable-wrap" ref={wrapRef}>
        <button type="button" className={className} onClick={notify}>
          {children}
        </button>
        <DownloadUnavailableNotice phase={phase} onClose={hide} />
      </span>
    );
  }

  return (
    <a href={siteConfig.erpDownloadPath} download={siteConfig.erpDownloadFileName} className={className}>
      {children}
    </a>
  );
}

function buttonClasses(variant: ButtonProps["variant"]) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
    variant === "primary" && "bg-[var(--primary)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--primary-hover)]",
    variant === "secondary" && "border border-[var(--border)] bg-white text-[var(--navy)] shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
    variant === "ghost" && "text-[var(--navy)] hover:bg-[var(--surface-soft)]",
    variant === "dark" && "bg-white text-[var(--navy)] hover:bg-[var(--surface-soft)]",
  );
}
