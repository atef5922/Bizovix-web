import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CustomerLoginForm } from "@/components/commercial/LoginForm";
import { getCustomerSession } from "@/src/server/auth/session";
import { isDatabaseConfigured } from "@/src/server/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Portal Sign In",
  robots: { index: false, follow: false },
};

export default async function AccountLoginPage() {
  if (await getCustomerSession()) redirect("/account");
  return <CustomerLoginForm configured={isDatabaseConfigured()} />;
}
