import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isStaticExport = process.env.NEXT_OUTPUT_EXPORT === "true";

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  ...(isStaticExport
    ? {
        output: "export",
      }
    : {
        async redirects() {
          return [
            {
              source: "/:path*",
              has: [
                {
                  type: "host",
                  value: "www.bizovix.com",
                },
              ],
              destination: "https://bizovix.com/:path*",
              permanent: true,
            },
            {
              source: "/index.html",
              destination: "/",
              permanent: true,
            },
            {
              source: "/home",
              destination: "/",
              permanent: true,
            },
            {
              source: "/privacy",
              destination: "/privacy-policy",
              permanent: true,
            },
            {
              source: "/terms-and-conditions",
              destination: "/terms",
              permanent: true,
            },
          ];
        },
      }),
};

export default nextConfig;
