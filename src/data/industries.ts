import type { Industry } from "@/src/types/site";

export const industries: Industry[] = [
  {
    slug: "manufacturing",
    title: "Manufacturing",
    icon: "Factory",
    group: "Production and Manufacturing",
    description:
      "Plan production, manage raw materials, control work orders, monitor costing, and update finished goods from one connected ERP platform.",
    painPoints: ["Raw material shortages", "Unclear work order status", "Disconnected production cost tracking"],
    useCases: ["Bill of materials planning", "Work order progress tracking", "Finished-goods inventory updates"],
    connectedSolutions: ["Manufacturing", "Inventory", "Purchase", "Accounting"],
  },
  {
    slug: "garments-textile",
    title: "Garments and Textile",
    icon: "Shirt",
    group: "Production and Manufacturing",
    description:
      "Coordinate fabric, trims, cutting, sewing, finishing, quality, shipment readiness, payroll context, and order costing.",
    painPoints: ["Fabric and trims visibility gaps", "Line progress blind spots", "Manual shipment readiness tracking"],
    useCases: ["Fabric and trims control", "Line-wise production updates", "Order costing and delivery visibility"],
    connectedSolutions: ["Manufacturing", "Inventory", "Sales", "HR and Payroll"],
  },
  {
    slug: "pharmaceuticals",
    title: "Pharmaceuticals",
    icon: "Pill",
    group: "Production and Manufacturing",
    description:
      "Support batch visibility, stock discipline, approved purchasing, production movement, warehouse control, and business reporting.",
    painPoints: ["Batch movement complexity", "Strict stock handling needs", "Approval-heavy procurement"],
    useCases: ["Batch stock tracking", "Approved purchase workflows", "Production and warehouse reporting"],
    connectedSolutions: ["Inventory", "Purchase", "Manufacturing", "Accounting"],
  },
  {
    slug: "wholesale-distribution",
    title: "Wholesale and Distribution",
    icon: "Warehouse",
    group: "Commerce and Distribution",
    description:
      "Connect purchase, multi-warehouse stock, sales orders, customer credit, delivery readiness, and branch-level reporting.",
    painPoints: ["Branch stock mismatch", "Customer credit uncertainty", "Order fulfillment delays"],
    useCases: ["Multi-warehouse stock control", "Sales order allocation", "Customer account statements"],
    connectedSolutions: ["Inventory", "Sales", "Client and Vendor", "Accounting"],
  },
  {
    slug: "retail-pos",
    title: "Retail and POS",
    icon: "Store",
    group: "Commerce and Distribution",
    description:
      "Run counter sales, connected stock, daily cash summaries, returns, discounts, customer records, and store-level reporting.",
    painPoints: ["Slow checkout", "Unclear daily cash", "Stock updates after sales"],
    useCases: ["Counter sales and receipts", "Daily closing summaries", "Real-time stock updates"],
    connectedSolutions: ["Point of Sale (POS)", "Inventory", "Accounting", "Client and Vendor"],
  },
  {
    slug: "construction",
    title: "Construction",
    icon: "HardHat",
    group: "Project and Site Operations",
    description:
      "Manage project purchasing, site-wise inventory, vendor payments, approval flows, and project cost visibility.",
    painPoints: ["Site material leakage", "Project cost uncertainty", "Approval delays"],
    useCases: ["Site-wise stock control", "Project purchase approval", "Vendor payable tracking"],
    connectedSolutions: ["Purchase", "Inventory", "Accounting", "Client and Vendor"],
  },
];

export function getIndustry(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}
