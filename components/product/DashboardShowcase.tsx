"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Bell, CheckCircle2, ClipboardList, PackageCheck, Users } from "lucide-react";

const modules = {
  executive: {
    label: "Executive",
    stats: [
      ["Revenue", "BDT 18.4M", "+12%"],
      ["Expense", "BDT 11.2M", "-4%"],
      ["Profit", "BDT 7.2M", "+18%"],
      ["Approvals", "24", "Pending"],
    ],
    tasks: ["Production line A is 82% complete", "Three purchase approvals need review", "Low stock alert for cotton yarn"],
  },
  manufacturing: {
    label: "Manufacturing",
    stats: [
      ["Work Orders", "48", "Active"],
      ["Completed", "71%", "Today"],
      ["Rejection", "1.8%", "Controlled"],
      ["Raw Materials", "9", "Alerts"],
    ],
    tasks: ["BOM ready for woven shirt order", "Machine M-04 maintenance due", "Finished goods posted to warehouse 2"],
  },
  inventory: {
    label: "Inventory",
    stats: [
      ["Stock Value", "BDT 32M", "Live"],
      ["Warehouses", "6", "Synced"],
      ["Low Stock", "14", "SKUs"],
      ["Transfers", "31", "Open"],
    ],
    tasks: ["Incoming purchase receive scheduled", "Warehouse 3 transfer awaiting approval", "Batch movement audit completed"],
  },
  finance: {
    label: "Finance",
    stats: [
      ["Receivables", "BDT 5.6M", "Open"],
      ["Payables", "BDT 3.1M", "Due"],
      ["Cash Flow", "Positive", "30 days"],
      ["Journals", "126", "Posted"],
    ],
    tasks: ["Customer payment matched", "Supplier bill ready for approval", "Inventory valuation updated"],
  },
};

const trend = [
  { name: "Jan", sales: 42, production: 34 },
  { name: "Feb", sales: 48, production: 38 },
  { name: "Mar", sales: 56, production: 47 },
  { name: "Apr", sales: 61, production: 52 },
  { name: "May", sales: 70, production: 59 },
  { name: "Jun", sales: 78, production: 68 },
];

export function DashboardShowcase({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<keyof typeof modules>("executive");
  const activeModule = modules[active];

  return (
    <div className={compact ? "product-window compact" : "product-window"} aria-label="Bizovix product dashboard preview">
      <div className="product-topbar">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Bizovix ERP</p>
          <h3>{activeModule.label} Dashboard</h3>
        </div>
        <div className="hidden items-center gap-2 text-xs text-[var(--muted-foreground)] sm:flex">
          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> Live operations
        </div>
      </div>
      <div className="module-tabs" role="tablist" aria-label="Dashboard modules">
        {(Object.keys(modules) as Array<keyof typeof modules>).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={active === key} onClick={() => setActive(key)}>
            {modules[key].label}
          </button>
        ))}
      </div>
      <motion.div key={active} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <div className="metric-grid">
          {activeModule.stats.map(([label, value, note]) => (
            <div className="metric-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
        <div className="dashboard-grid">
          <div className="chart-card">
            <div className="chart-heading">
              <span>Sales and production trend</span>
              <Activity className="h-4 w-4" />
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="sales" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#126CFF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#126CFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E5ECF8" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#126CFF" fill="url(#sales)" strokeWidth={3} />
                  <Area type="monotone" dataKey="production" stroke="#11B5D8" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-heading">
              <span>Operational queue</span>
              <ClipboardList className="h-4 w-4" />
            </div>
            <ul className="task-list">
              {activeModule.tasks.map((task, index) => (
                <li key={task}>
                  <span>{index + 1}</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
          {!compact && (
            <div className="chart-card mobile-summary">
              <div className="phone-frame">
                <div className="phone-row"><Bell className="h-4 w-4" /><span>Approvals</span><strong>24</strong></div>
                <div className="phone-row"><PackageCheck className="h-4 w-4" /><span>Stock alerts</span><strong>14</strong></div>
                <div className="phone-row"><Users className="h-4 w-4" /><span>Attendance</span><strong>94%</strong></div>
              </div>
            </div>
          )}
          {!compact && (
            <div className="chart-card">
              <div className="chart-heading">
                <span>Warehouse comparison</span>
                <PackageCheck className="h-4 w-4" />
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend.slice(0, 4)}>
                    <CartesianGrid stroke="#E5ECF8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="production" fill="#11B5D8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="sales" fill="#126CFF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <p className="sr-only">Chart summary: sales, production, stock, approvals, and finance metrics are shown as readable dashboard cards.</p>
    </div>
  );
}
