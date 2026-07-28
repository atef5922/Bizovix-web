import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Download, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/forms/LeadForms";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { siteConfig } from "@/src/config/site";
import { organizationJsonLd, pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Bizovix",
  description: "Contact Bizovix for ERP software download support, implementation planning, sales support, partnerships, and cloud ERP guidance in Bangladesh and South Asia.",
  path: "/contact",
});

const supportItems = [
  "ERP software download and setup guidance",
  "Implementation planning and rollout guidance",
  "Support, partnership, and product questions",
];

export default function ContactPage() {
  const phoneHref = siteConfig.salesPhone.replace(/\s/g, "");

  return (
    <>
      <SEOJsonLd data={organizationJsonLd()} />

      <section className="contact-page-hero">
        <div className="container-shell contact-page-hero-inner">
          <p>Contact Us</p>
          <h1>Let&apos;s talk about your ERP needs</h1>
        </div>
      </section>

      <section className="contact-main-section">
        <div className="container-shell contact-main-card">
          <div className="contact-main-info">
            <p className="contact-kicker">Bizovix ERP support</p>
            <h2>
              Our team is ready to assist you with{" "}
              <span className="title-accent">consultation</span>, setup, and after-sales support.
            </h2>
            <p>
              Whether you are planning your first cloud ERP implementation or upgrading an existing
              workflow, Bizovix helps you make informed decisions around finance, inventory, purchase,
              manufacturing, sales, POS, HR payroll, approvals, dashboards, and reporting.
            </p>

            <div className="contact-detail-list">
              <a href={`tel:${phoneHref}`}><Phone className="h-5 w-5" /><span>{siteConfig.salesPhone}</span></a>
              <a href={`mailto:${siteConfig.salesEmail}`}><Mail className="h-5 w-5" /><span>{siteConfig.salesEmail}</span></a>
              <span><MapPin className="h-5 w-5" />{siteConfig.address}</span>
            </div>

            <div className="contact-support-list">
              {supportItems.map((item) => (
                <span key={item}><ShieldCheck className="h-4 w-4" />{item}</span>
              ))}
            </div>
          </div>

          <div className="contact-form-blue-card" id="contact-form">
            <p className="contact-form-title">Get in touch with Bizovix to explore how connected ERP can transform your business operations.</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="contact-map-section">
        <div className="container-shell contact-map-heading">
          <div>
            <p className="contact-kicker">Find us</p>
            <h2>
              Bizovix works with growing businesses across{" "}
              <span className="title-accent">Bangladesh and South Asia</span>
            </h2>
          </div>
          <a href={siteConfig.erpDownloadPath} download={siteConfig.erpDownloadFileName}>
            Download ERP software <Download className="h-4 w-4" />
          </a>
        </div>
        <div className="contact-map-frame">
          <iframe
            title="Bizovix office location in Dhaka, Bangladesh"
            src="https://www.google.com/maps?q=Dhaka%2C%20Bangladesh&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="contact-map-card">
            <Building2 className="h-5 w-5" />
            <strong>Bangladesh</strong>
            <span>ERP consultation, implementation planning, and product support</span>
          </div>
        </div>
      </section>

      <section className="contact-bottom-cta">
        <div className="container-shell contact-bottom-inner">
          <div>
            <MessageCircle className="h-6 w-6" />
            <h2>Need faster ERP guidance?</h2>
            <p>Share your company size, industry, branch count, and required modules so our team can route your request correctly.</p>
          </div>
          <a href={siteConfig.erpDownloadPath} download={siteConfig.erpDownloadFileName}>
            Download ERP software <Send className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
