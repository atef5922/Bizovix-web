"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MonitorPlay, X } from "lucide-react";
import { Button } from "./Button";
import { DemoRequestForm } from "@/components/forms/LeadForms";
import { siteConfig } from "@/src/config/site";

export function SiteTools() {
  const [cookie, setCookie] = useState(false);
  const [visible, setVisible] = useState(false);
  const [contactMode, setContactMode] = useState<"messenger" | "whatsapp">("messenger");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCookie(localStorage.getItem("bizovix-cookie-ok") !== "yes");
    }, 0);
    const contactTimer = window.setInterval(() => {
      setContactMode((mode) => (mode === "messenger" ? "whatsapp" : "messenger"));
    }, 4200);
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(contactTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const contactUrl = contactMode === "messenger" ? siteConfig.messenger : `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`;
  const contactLabel = contactMode === "messenger" ? "Contact Bizovix on Messenger" : "Contact Bizovix on WhatsApp";

  return (
    <>
      <a
        className={`chat-action is-${contactMode}`}
        href={contactUrl}
        aria-label={contactLabel}
        target="_blank"
        rel="noreferrer"
      >
        {contactMode === "messenger" ? <MessengerLogo /> : <WhatsAppLogo />}
      </a>
      {visible && (
        <button className="back-top" type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      {cookie && (
        <div className="cookie-bar" role="region" aria-label="Cookie consent">
          <p>Bizovix uses essential cookies for site preferences and form experience.</p>
          <button type="button" onClick={() => { localStorage.setItem("bizovix-cookie-ok", "yes"); setCookie(false); }}>Accept</button>
        </div>
      )}
    </>
  );
}

function MessengerLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="url(#messenger-gradient)" d="M24 4C12.7 4 4 12.28 4 23.44c0 5.84 2.4 10.88 6.3 14.35V44l5.76-3.17A22.2 22.2 0 0 0 24 42.89c11.3 0 20-8.28 20-19.45S35.3 4 24 4Z" />
      <path fill="#fff" d="m11.92 29.12 9.78-10.38 5.12 5.44 9.26-5.44-9.78 10.38-5.12-5.44-9.26 5.44Z" />
      <defs>
        <linearGradient id="messenger-gradient" x1="9.86" x2="38.4" y1="38.2" y2="9.64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#006AFF" />
          <stop offset="0.5" stopColor="#A334FA" />
          <stop offset="1" stopColor="#FF6968" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#25D366" d="M24.02 4C12.98 4 4 12.86 4 23.75c0 3.55.97 7.02 2.82 10.05L4.98 44l10.42-2.72a20.24 20.24 0 0 0 8.62 1.94C35.06 43.22 44 34.36 44 23.47 44 12.6 35.06 4 24.02 4Z" />
      <path fill="#fff" d="M34.74 29.62c-.52-.26-3.08-1.5-3.56-1.67-.48-.18-.83-.26-1.18.26-.35.52-1.35 1.67-1.65 2.02-.3.34-.61.39-1.13.13-.52-.26-2.2-.8-4.19-2.56-1.55-1.38-2.6-3.08-2.9-3.6-.3-.52-.03-.8.23-1.06.24-.23.52-.6.78-.9.26-.31.35-.52.52-.87.17-.34.09-.65-.04-.91-.13-.26-1.18-2.82-1.61-3.86-.43-1-.86-.86-1.18-.87l-1-.02c-.35 0-.91.13-1.39.65-.48.52-1.83 1.78-1.83 4.34s1.87 5.04 2.13 5.39c.26.34 3.68 5.56 8.92 7.8 1.25.54 2.22.86 2.98 1.1 1.25.39 2.39.34 3.29.21 1-.15 3.08-1.24 3.52-2.43.43-1.19.43-2.21.3-2.43-.13-.22-.48-.35-1-.61Z" />
    </svg>
  );
}

export function DemoModalButton({ label = "Request Product Tour" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <MonitorPlay className="h-4 w-4" /> {label}
      </Button>
      {open && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Request a Bizovix demo">
          <div className="modal-panel">
            <div className="modal-head">
              <div>
                <p className="eyebrow">Product tour</p>
                <h2>Tell us what you need to connect</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close demo request"><X className="h-5 w-5" /></button>
            </div>
            <DemoRequestForm compact />
          </div>
        </div>
      )}
    </>
  );
}
