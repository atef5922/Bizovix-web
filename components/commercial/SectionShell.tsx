import type { LucideIcon } from "lucide-react";

/** Server components — layout chrome shared by every admin section page. */

export function SectionHeading({
  eyebrow = "BIZOVIX COMMERCIAL",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="workspace-heading compact">
      <div>
        <p className="workspace-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </div>
      {actions ? <div className="heading-actions">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  tall = true,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tall?: boolean;
}) {
  return (
    <div className={`table-empty ${tall ? "tall" : ""}`}>
      <Icon />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function DataPanel({ children }: { children: React.ReactNode }) {
  return <section className="workspace-panel data-panel">{children}</section>;
}

/**
 * Horizontal scroll container. Admin tables are wide by nature; without this the
 * page body itself scrolls sideways on a laptop screen.
 */
export function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="table-scroll">{children}</div>;
}
