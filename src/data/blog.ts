import type { BlogPost } from "@/src/types/site";

export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-bill-of-materials",
    title: "What is Bill of Materials in Manufacturing ERP?",
    category: "Manufacturing",
    author: "Bizovix ERP Team",
    reviewer: "Implementation Advisor",
    updated: "2026-07-22",
    readingTime: "7 min read",
    excerpt: "Understand how BOMs connect raw materials, production planning, costing, and finished goods.",
    sections: [
      { heading: "Why BOM Matters", body: "A bill of materials gives production teams a structured list of raw materials, quantities, and operating requirements for each finished product." },
      { heading: "How ERP Uses BOM Data", body: "When BOM, inventory, purchase, and costing data live together, teams can plan materials earlier and understand production cost with less manual reconciliation." },
    ],
  },
  {
    slug: "purchase-order-approval-workflow",
    title: "How Purchase Order Approval Workflows Reduce Operational Risk",
    category: "Purchase",
    author: "Bizovix ERP Team",
    reviewer: "Finance Workflow Specialist",
    updated: "2026-07-22",
    readingTime: "6 min read",
    excerpt: "A clear approval path helps teams control spending without slowing urgent operations.",
    sections: [
      { heading: "The Approval Problem", body: "Purchase requests often move across messages, spreadsheets, and verbal approvals. That makes budget, supplier, and delivery visibility harder than it needs to be." },
      { heading: "Connected Purchase Controls", body: "ERP workflows can connect requisition, approval, purchase order, goods receipt, supplier bills, and payment tracking." },
    ],
  },
  {
    slug: "inventory-accounting-integration",
    title: "Why Inventory and Accounting Should Stay Connected",
    category: "Accounting",
    author: "Bizovix ERP Team",
    reviewer: "Finance Systems Reviewer",
    updated: "2026-07-22",
    readingTime: "8 min read",
    excerpt: "Disconnected inventory and accounting systems create slow reporting and unreliable margins.",
    sections: [
      { heading: "The Hidden Cost of Separation", body: "When stock movements and finance entries are updated separately, teams spend more time checking numbers than making decisions." },
      { heading: "What Connected ERP Improves", body: "Sales, purchase, stock valuation, receivables, payables, and profitability reports become easier to review when workflows share one operating record." },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
