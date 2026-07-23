import type { MetadataRoute } from "next";

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
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/bizovix-symbol.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
