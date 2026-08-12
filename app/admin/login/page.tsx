import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StaffLoginForm } from "@/components/commercial/LoginForm";
import { getStaffSession } from "@/src/server/auth/session";
import { isDatabaseConfigured } from "@/src/server/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Control Center Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getStaffSession()) redirect("/admin");

  return (
    <StaffLoginForm
      configured={isDatabaseConfigured()}
      title="Control Center"
      subtitle="Bizovix commercial operations"
    />
  );
}
