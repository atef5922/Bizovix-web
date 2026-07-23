# Deployment Guide

Use the normal build command before deployment:

```bash
npm run build
```

Set `NEXT_PUBLIC_SITE_URL` to the final production domain so canonical URLs, robots, sitemap, and Open Graph metadata resolve correctly.

Optional contact and API variables can remain empty; safe fallbacks prevent the site from crashing.
