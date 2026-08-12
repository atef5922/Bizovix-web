import "server-only";

export const DEFAULT_PAGE_SIZE = 20;

/**
 * `x-forwarded-for` may carry a proxy chain ("client, proxy1, proxy2") —
 * the first entry is the original client. Falls back to `x-real-ip` for
 * proxies that only set that header.
 */
export function clientIp(headerList: Headers): string | null {
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? null;
}

export type ListParams = {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type ListResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function normalizeListParams(params: ListParams) {
  const pageSize = Math.min(Math.max(params.pageSize ?? DEFAULT_PAGE_SIZE, 5), 100);
  const page = Math.max(params.page ?? 1, 1);
  const search = params.search?.trim().toLowerCase() || undefined;
  const status = params.status?.trim() || undefined;
  return { page, pageSize, offset: (page - 1) * pageSize, search, status };
}

export function toListResult<T>(
  rows: T[],
  total: number,
  page: number,
  pageSize: number,
): ListResult<T> {
  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Parses `searchParams` from a page into list params. */
export function listParamsFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ListParams {
  const single = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const pageRaw = Number(single("page"));
  return {
    search: single("q"),
    status: single("status"),
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

/* -------------------------------------------------------------------------- */
/* Money                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Amounts are stored as numeric(18,4) and read back as strings; parsing them
 * into floats for display is fine, but every arithmetic total is computed in
 * SQL so no rounding error can accumulate in JS.
 */
export function formatMoney(amount: string | number | null, currency = "BDT"): string {
  if (amount === null) return "—";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "—";
  return `${currency} ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMinor(priceMinor: number, currency = "BDT"): string {
  return formatMoney(priceMinor / 100, currency);
}

export function formatDate(value: Date | null | undefined): string {
  if (!value) return "—";
  return value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "—";
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(value: Date | null | undefined): string {
  if (!value) return "—";
  const diffMs = Date.now() - value.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

/** Days until a date, negative when already past. */
export function daysUntil(value: Date | null | undefined): number | null {
  if (!value) return null;
  return Math.ceil((value.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}
