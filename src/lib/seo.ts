import type { Metadata } from "next";
import { absoluteUrl } from "./utils";
import { siteConfig } from "@/src/config/site";

type MetaInput = {
  title: string;
  description: string;
  path?: string;
};

export function pageMetadata({ title, description, path = "/" }: MetaInput): Metadata {
  const url = absoluteUrl(path);
  const pageTitle = title.endsWith(" | Bizovix") ? title.replace(" | Bizovix", "") : title;
  const fullTitle = pageTitle.includes("Bizovix") ? pageTitle : `${pageTitle} | Bizovix`;

  return {
    title: pageTitle,
    description,
    keywords: [
      "Bizovix",
      "cloud ERP software",
      "ERP software Bangladesh",
      "business management software",
      "accounting ERP",
      "inventory management ERP",
      "manufacturing ERP",
      "POS software",
      "HR payroll ERP",
      pageTitle,
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630, alt: "Bizovix cloud ERP platform preview" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(siteConfig.ogImage)],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/bizovix-logo-nav.png"),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.salesPhone,
      email: siteConfig.salesEmail,
      contactType: "sales",
      areaServed: ["BD", "Worldwide"],
    },
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Bizovix Cloud ERP",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "ERP software download and implementation pricing are discussed with the Bizovix team." },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
