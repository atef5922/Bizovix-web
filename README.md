# Bizovix Cloud ERP Website

Production-ready marketing frontend for Bizovix, a cloud ERP SaaS platform built for Bangladesh and ready for global business operations.

## What is included

- Multi-page Next.js App Router site
- Responsive desktop, tablet, and mobile navigation
- Solutions, industries, pricing, resources, blog, FAQ, legal, demo, contact, and career routes
- Typed content in `src/data`
- Mock async services in `src/services`
- React Hook Form + Zod validation
- Product dashboard components with chart summaries
- Sitemap, robots, manifest, Open Graph route, canonical metadata, and JSON-LD helpers
- Cookie consent, search dialog, demo modal, newsletter form, back-to-top, and WhatsApp action

## Local development

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Build and validate:

```bash
npm run build
npm run lint
npm test
```

## Project notes

- The official logo is stored at `public/brand/bizovix-logo.png`.
- Future logo variants are prepared at `public/brand/bizovix-logo-dark.png`, `public/brand/bizovix-logo-light.png`, and `public/brand/bizovix-symbol.png`.
- Legal pages are production-shaped placeholders and should be reviewed by counsel before launch.
- Pricing is intentionally implementation-led to avoid unsupported fixed-price claims.

More handoff guides are in `docs/`.
