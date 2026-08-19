export const siteConfig = {
  name: "Bizovix",
  tagline: "Built for Bangladesh. Ready for the World.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://bizovix.com",
  ogImage: "/og-image.png",
  salesPhone: process.env.NEXT_PUBLIC_SALES_PHONE || "+880 1958-645415",
  salesPhoneSecondary: process.env.NEXT_PUBLIC_SALES_PHONE_SECONDARY || "+880 1958-645426",
  salesEmail: process.env.NEXT_PUBLIC_SALES_EMAIL || "sales@bizovix.com",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bizovix.com",
  address: process.env.NEXT_PUBLIC_OFFICE_ADDRESS || "3rd Floor, 36-37 Umesh Datta Road, Bakshibazar, Dhaka - 1211, Bangladesh",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+8801958645415",
  messenger: process.env.NEXT_PUBLIC_MESSENGER_URL || "https://m.me/bizovix",
  // Every download link on the site points at this tracking route, which
  // records the event and 302s to the current installer. That is what feeds
  // the admin Downloads section. Tracking is best-effort — the redirect still
  // happens if the database is unreachable.
  // For a static export (no server), set this back to erpDownloadFallbackPath.
  erpDownloadPath:
    process.env.NEXT_OUTPUT_EXPORT === "true"
      ? "/software/Bizovix-ERP-Setup-0.1.0.exe"
      : "/api/download/windows",
  erpDownloadFallbackPath: "/software/Bizovix-ERP-Setup-0.1.0.exe",
  erpDownloadFileName: "Bizovix-ERP-Setup-0.1.0.exe",
  // The published installer is an old build; the next release isn't ready
  // yet. Flip this back to true once the new version is live — every
  // download button on the site reads this same flag.
  erpDownloadEnabled: false,
  erpDownloadUnavailableMessage: "New Version Coming Soon",
  description:
    "Bizovix is a cloud ERP SaaS platform for accounting, purchase, inventory, manufacturing, sales, POS, HR, payroll, reporting, and multi-branch operations.",
};
