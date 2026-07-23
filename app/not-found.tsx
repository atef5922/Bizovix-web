import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="container-shell">
        <p className="eyebrow">404</p>
        <h1>That Bizovix page is not available</h1>
        <p>The route may have moved, or the content may not be published yet.</p>
        <div className="button-row">
          <Link className="nav-link active" href="/">Go Home</Link>
          <Link className="nav-link active" href="/demo-request">Request Demo</Link>
        </div>
      </div>
    </section>
  );
}
