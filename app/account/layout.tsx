/**
 * Chrome-free wrapper so /account/login renders without the portal sidebar.
 * The shell and auth guard live in app/account/(panel)/layout.tsx.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
