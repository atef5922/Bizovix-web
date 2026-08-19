import { WorkspaceShell } from "@/components/commercial/WorkspaceShell";
import { customerLogoutAction } from "@/src/server/actions/auth.actions";
import { requireCustomerPage } from "@/src/server/auth/guard";
import { staffInitials } from "@/src/server/auth/roles";
import { getCustomerNotifications } from "@/src/server/services/notifications";

export const dynamic = "force-dynamic";

const ROLE_LABELS = {
  OWNER: "Company owner",
  ADMIN: "Company admin",
  MEMBER: "Team member",
} as const;

export default async function AccountPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerPage();
  const notifications = await getCustomerNotifications(session.company.id);

  return (
    <WorkspaceShell
      kind="account"
      user={{
        name: session.user.name,
        email: session.user.email,
        initials: staffInitials(session.user.name),
        roleLabel: ROLE_LABELS[session.user.role],
      }}
      notifications={notifications}
      signOutAction={customerLogoutAction}
    >
      {children}
    </WorkspaceShell>
  );
}
