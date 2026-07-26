export type IconName =
  | "Factory"
  | "Shirt"
  | "Pill"
  | "CookingPot"
  | "Warehouse"
  | "Store"
  | "ShoppingBag"
  | "Truck"
  | "HardHat"
  | "BriefcaseBusiness"
  | "Calculator"
  | "Landmark"
  | "ShoppingCart"
  | "Boxes"
  | "TrendingUp"
  | "ReceiptText"
  | "UsersRound"
  | "Handshake"
  | "Building2"
  | "Newspaper"
  | "MessagesSquare"
  | "BookOpen"
  | "ShieldCheck"
  | "ChartNoAxesCombined"
  | "ClipboardCheck";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: IconName;
  group?: string;
}

export interface Solution {
  slug: string;
  title: string;
  shortTitle: string;
  icon: IconName;
  group: "Finance and Commerce" | "Operations and Production" | "People and Relationships";
  description: string;
  hero: string;
  outcomes: string[];
  workflows: string[];
  metrics: string[];
}

export interface Industry {
  slug: string;
  title: string;
  icon: IconName;
  group: "Production and Manufacturing" | "Commerce and Distribution" | "Project and Service";
  description: string;
  painPoints: string[];
  useCases: string[];
  connectedSolutions: string[];
}

export interface ResourceItem {
  slug: string;
  title: string;
  category: "ERP Guides" | "Case Studies" | "Checklists" | "Product Updates";
  summary: string;
  readingTime: string;
  related: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  author: string;
  reviewer: string;
  updated: string;
  readingTime: string;
  image?: string;
  excerpt: string;
  sections: Array<{ heading: string; body: string }>;
}
