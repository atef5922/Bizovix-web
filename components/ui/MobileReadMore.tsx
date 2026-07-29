"use client";

import { useState, type ReactNode } from "react";

export function MobileReadMore({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className="mobile-read-more" data-expanded={expanded ? "true" : "false"}>
      <span className="mobile-read-more-copy">{children}</span>
      <button
        className="mobile-read-more-toggle"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? "Show Less" : "Learn More"}
      </button>
    </span>
  );
}
