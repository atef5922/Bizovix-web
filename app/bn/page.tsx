import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/MarketingSections";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Bangla Site", description: "Bangla localization entry prepared for Bizovix.", path: "/bn" });

export default function BanglaEntryPage() {
  return <PageHero badge="Localization" title="বাংলা কনটেন্ট আর্কিটেকচার প্রস্তুত" description="বর্তমান ইংরেজি পেজগুলো মূল রুটে আছে, এবং /bn ভবিষ্যৎ বাংলা কনটেন্টের জন্য প্রস্তুত।"><Link className="nav-link active" href="/">মূল সাইটে যান</Link></PageHero>;
}
