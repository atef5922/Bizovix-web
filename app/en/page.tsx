import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "English ERP Site",
    description: "Bizovix English site entry for cloud ERP software, modules, pricing, resources, and implementation content.",
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

export default function EnglishEntryPage() {
  return (
    <PageHero
      badge="Localization"
      title="English ERP content is available on the main site"
      description="The current canonical English pages live at the root while /en is reserved for future localized routing and language-specific SEO expansion."
    >
      <Link className="nav-link active" href="/">Open current English site</Link>
    </PageHero>
  );
}
