"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle, MonitorPlay, X } from "lucide-react";
import { Button } from "./Button";
import { DemoRequestForm } from "@/components/forms/LeadForms";
import { siteConfig } from "@/src/config/site";

export function SiteTools() {
  const [cookie, setCookie] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCookie(localStorage.getItem("bizovix-cookie-ok") !== "yes");
    }, 0);
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <a className="whatsapp-action" href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`} aria-label="Contact Bizovix on WhatsApp">
        <MessageCircle className="h-5 w-5" />
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
