"use client";

import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export type FilterOption = { value: string; label: string };

/**
 * Search and filters live in the URL, not component state: that keeps a
 * filtered view shareable and bookmarkable, and it means the server component
 * re-queries rather than the client filtering a partial page of rows.
 */
export function DataToolbar({
  placeholder,
  filters,
  filterLabel = "Filters",
  children,
}: {
  placeholder: string;
  filters?: FilterOption[];
  filterLabel?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [term, setTerm] = useState(searchParams.get("q") ?? "");
  const status = searchParams.get("status") ?? "ALL";
  const firstRender = useRef(true);

  // Debounced so typing does not fire a query per keystroke.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) params.set("q", term);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
    }, 350);
    return () => window.clearTimeout(timeout);
    // `searchParams` is intentionally excluded: including it would restart the
    // debounce every time the URL updates and cancel the user's own typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, pathname, router]);

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") params.set("status", value);
    else params.delete("status");
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  }

  return (
    <div className={`data-toolbar ${isPending ? "is-loading" : ""}`}>
      <div className="workspace-search">
        <Search />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>
      <div className="data-toolbar-right">
        {filters && filters.length > 0 ? (
          <label className="filter-select">
            <SlidersHorizontal />
            <span className="sr-only">{filterLabel}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {filters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="data-pagination">
      <span>
        {total === 0 ? "No records" : `Showing ${from}–${to} of ${total}`}
      </span>
      <div>
        <button type="button" onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft />
        </button>
        <strong>
          {page} / {pageCount}
        </strong>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
