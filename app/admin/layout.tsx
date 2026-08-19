/**
 * Intentionally chrome-free: /admin/login renders through this layout and must
 * not get the workspace sidebar. The panel chrome and auth guard live in
 * app/admin/(panel)/layout.tsx instead.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
