import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "English Site", description: "English localization entry prepared for Bizovix.", path: "/en" });

export default function EnglishEntryPage() {
  return <PageHero badge="Localization" title="English content architecture is prepared" description="The current canonical English pages live at the root while /en is reserved for future localized routing."><Link className="nav-link active" href="/">Open current English site</Link></PageHero>;
}
