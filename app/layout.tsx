import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteTools } from "@/components/ui/SiteTools";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { organizationJsonLd, softwareJsonLd } from "@/src/lib/seo";
import { siteConfig } from "@/src/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Bizovix Cloud ERP Software",
    template: "%s | Bizovix",
  },
  description: siteConfig.description,
  applicationName: "Bizovix",
  openGraph: {
    title: "Bizovix Cloud ERP Software",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "Bizovix",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "Bizovix ERP dashboard and connected workflow preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bizovix Cloud ERP Software",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#155eef",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="32x32" />
        <link rel="icon" href="/favicon-32x32.png?v=2" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
      </head>
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <SiteTools />
        <SEOJsonLd data={organizationJsonLd()} />
        <SEOJsonLd data={softwareJsonLd()} />
      </body>
    </html>
  );
}
