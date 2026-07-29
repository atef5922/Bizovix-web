import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bizovix Cloud ERP",
    short_name: "Bizovix",
    description: "Cloud ERP software for connected business operations.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7fbff",
    theme_color: "#126cff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
