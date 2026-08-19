import { WorkspaceShell } from "@/components/commercial/WorkspaceShell";
import { staffLogoutAction } from "@/src/server/actions/auth.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffInitials, STAFF_ROLE_LABELS } from "@/src/server/auth/roles";
import { getStaffNotifications } from "@/src/server/services/notifications";

// Every page here reads live per-request data behind a session cookie; none of
// it can be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffPage();
  const notifications = await getStaffNotifications();

  return (
    <WorkspaceShell
      kind="admin"
      user={{
        name: session.user.name,
        email: session.user.email,
        initials: staffInitials(session.user.name),
        roleLabel: STAFF_ROLE_LABELS[session.user.role],
      }}
      notifications={notifications}
      signOutAction={staffLogoutAction}
    >
      {children}
    </WorkspaceShell>
  );
}
