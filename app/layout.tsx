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
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Bizovix Cloud ERP Software",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "Bizovix",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Bizovix ERP dashboard and connected workflow preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bizovix Cloud ERP Software",
    description: siteConfig.description,
    images: ["/opengraph-image"],
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
