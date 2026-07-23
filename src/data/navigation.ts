import type { NavItem } from "@/src/types/site";
import { industries } from "./industries";
import { solutions } from "./solutions";

export const mainNavigation: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Industries", href: "/industries" },
  { title: "Solutions", href: "/solutions" },
  { title: "Pricing", href: "/pricing" },
  { title: "Resources", href: "/resources" },
];

export const industryNavigation = industries.map((industry) => ({
  title: industry.title,
  href: `/industries/${industry.slug}`,
  description: industry.description,
  icon: industry.icon,
  group: industry.group,
}));

export const solutionNavigation = solutions.map((solution) => ({
  title: solution.shortTitle,
  href: `/solutions/${solution.slug}`,
  description: solution.description,
  icon: solution.icon,
  group: solution.group,
}));

export const resourcesNavigation: NavItem[] = [
  { title: "About Us", href: "/about-us", icon: "Building2", description: "Learn how Bizovix supports connected business operations." },
  { title: "Blog", href: "/blog", icon: "Newspaper", description: "Practical ERP ideas for finance, production, stock, and growth." },
  { title: "Career", href: "/career", icon: "BriefcaseBusiness", description: "Join the team building ERP for Bangladesh and beyond." },
  { title: "Contact", href: "/contact", icon: "MessagesSquare", description: "Talk with sales, support, or implementation advisors." },
  { title: "Our Resources", href: "/resources", icon: "BookOpen", description: "Guides, checklists, updates, and ERP planning resources." },
];
