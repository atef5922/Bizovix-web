import Link from "next/link";
import { siteConfig } from "@/src/config/site";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="container-shell">
        <p className="eyebrow">404</p>
        <h1>That Bizovix page is not available</h1>
        <p>The route may have moved, or the content may not be published yet.</p>
        <div className="button-row">
          <Link className="nav-link active" href="/">Go Home</Link>
          <a className="nav-link active" href={siteConfig.erpDownloadPath} download={siteConfig.erpDownloadFileName}>Download ERP</a>
        </div>
      </div>
    </section>
  );
}
