"use client";

import {
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  ClipboardCheck,
  CookingPot,
  Factory,
  Handshake,
  HardHat,
  Landmark,
  MessagesSquare,
  Newspaper,
  Pill,
  ReceiptText,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/src/types/site";

const icons: Record<IconName, LucideIcon> = {
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  ClipboardCheck,
  CookingPot,
  Factory,
  Handshake,
  HardHat,
  Landmark,
  MessagesSquare,
  Newspaper,
  Pill,
  ReceiptText,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  UsersRound,
  Warehouse,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Component = icons[name] || Factory;
  return <Component aria-hidden="true" className={className} />;
}
