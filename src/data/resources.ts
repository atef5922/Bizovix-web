import type { ResourceItem } from "@/src/types/site";

export const resources: ResourceItem[] = [
  {
    slug: "erp-guides",
    title: "Complete Guide to ERP Software in Bangladesh",
    category: "ERP Guides",
    summary: "A practical guide to ERP selection, modules, implementation planning, and internal readiness for Bangladeshi businesses.",
    readingTime: "14 min read",
    related: ["Accounting", "Inventory", "Manufacturing"],
  },
  {
    slug: "case-studies",
    title: "ERP Readiness Scenarios for Growing Companies",
    category: "Case Studies",
    summary: "Illustrative implementation scenarios showing how teams can move from disconnected files to connected workflows.",
    readingTime: "10 min read",
    related: ["Manufacturing", "Sales", "Purchase"],
  },
  {
    slug: "checklists",
    title: "ERP Demo Preparation Checklist",
    category: "Checklists",
    summary: "A checklist for gathering process, data, reporting, and approval needs before requesting an ERP demo.",
    readingTime: "6 min read",
    related: ["Demo", "Implementation", "Reporting"],
  },
  {
    slug: "product-updates",
    title: "Product Update Notes",
    category: "Product Updates",
    summary: "A prepared update hub for release notes, workflow improvements, dashboard enhancements, and module additions.",
    readingTime: "5 min read",
    related: ["Dashboards", "Approvals", "Reports"],
  },
];
