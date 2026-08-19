import type { Metadata } from "next";
import Link from "next/link";
import { DownloadLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested Bizovix page is not available.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="container-shell">
        <p className="eyebrow">404</p>
        <h1>That Bizovix page is not available</h1>
        <p>The route may have moved, or the content may not be published yet.</p>
        <div className="button-row">
          <Link className="nav-link active" href="/">Go Home</Link>
          <DownloadLink className="nav-link active">Download ERP</DownloadLink>
        </div>
      </div>
    </section>
  );
}
