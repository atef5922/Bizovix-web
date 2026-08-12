import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { getStaffSession } from "@/src/server/auth/session";
import { getDb } from "@/src/server/db/client";
import { isDatabaseConfigured } from "@/src/server/env";

export const dynamic = "force-dynamic";

type SearchHit = {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  group: string;
};

/**
 * Backs the topbar search. Staff-gated like every other admin surface — an
 * unauthenticated caller must not be able to enumerate customer names by
 * probing this endpoint.
 */
export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ hits: [] }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ hits: [] });
  }

  const term = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (term.length < 2) {
    return NextResponse.json({ hits: [] });
  }

  const like = `%${term}%`;
  const db = getDb();

  const rows = await db.execute<{
    id: string;
    label: string;
    sublabel: string;
    href: string;
    grp: string;
  }>(sql`
    (
      select c.id::text, c.name as label,
             c.company_code || ' · ' || coalesce(c.email, 'no email') as sublabel,
             '/admin/companies?q=' || c.company_code as href,
             'Company' as grp
      from companies c
      where lower(c.name) like ${like}
         or lower(c.company_code) like ${like}
         or lower(coalesce(c.email, '')) like ${like}
      limit 5
    )
    union all
    (
      select l.id::text,
             l.license_key_prefix || '…' || l.license_key_last4 as label,
             c.name || ' · ' || l.status as sublabel,
             '/admin/licenses?q=' || l.license_key_last4 as href,
             'License' as grp
      from licenses l join companies c on c.id = l.company_id
      where lower(l.license_key_last4) like ${like}
         or lower(l.license_key_prefix) like ${like}
         or lower(c.name) like ${like}
      limit 5
    )
    union all
    (
      select p.id::text,
             c.name || ' — ' || p.amount::text || ' ' || p.currency_code as label,
             p.status || ' · ' || coalesce(p.reference, p.payment_method) as sublabel,
             '/admin/payments?q=' || c.company_code as href,
             'Payment' as grp
      from payments p join companies c on c.id = p.company_id
      where lower(c.name) like ${like}
         or lower(coalesce(p.reference, '')) like ${like}
      limit 5
    )
    union all
    (
      select d.id::text, d.device_name as label,
             c.name || ' · ' || d.status as sublabel,
             '/admin/devices?q=' || c.company_code as href,
             'Device' as grp
      from device_activations d join companies c on c.id = d.company_id
      where lower(d.device_name) like ${like}
         or lower(c.name) like ${like}
      limit 5
    )
    union all
    (
      select i.id::text, i.invoice_number as label,
             c.name || ' · ' || i.status as sublabel,
             '/admin/invoices?q=' || i.invoice_number as href,
             'Invoice' as grp
      from invoices i join companies c on c.id = i.company_id
      where lower(i.invoice_number) like ${like}
         or lower(c.name) like ${like}
      limit 5
    )
  `);

  const hits: SearchHit[] = rows.map((row) => ({
    id: row.id,
    label: row.label,
    sublabel: row.sublabel,
    href: row.href,
    group: row.grp,
  }));

  return NextResponse.json({ hits });
}
