import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Bangla ERP Site",
    description: "Bizovix Bangla page prepared for future localized ERP content for businesses in Bangladesh.",
    path: "/",
  }),
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function BanglaEntryPage() {
  return (
    <PageHero
      badge="Localization"
      title="Bizovix Bangla experience is being prepared"
      description="The main English website is currently active. A dedicated Bangla ERP experience will support local business teams with module, pricing, documentation, and implementation content."
    >
      <Link className="nav-link active" href="/">Open current site</Link>
    </PageHero>
  );
}
