"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { blogPosts } from "@/src/data/blog";
import { faqs } from "@/src/data/faqs";
import { industries } from "@/src/data/industries";
import { pricingPlans } from "@/src/data/pricing";
import { resources } from "@/src/data/resources";
import { solutions } from "@/src/data/solutions";
import { cn } from "@/src/lib/utils";

export function SolutionExplorer() {
  const groups = ["All", ...Array.from(new Set(solutions.map((solution) => solution.group)))];
  const [group, setGroup] = useState("All");
  const visible = group === "All" ? solutions : solutions.filter((solution) => solution.group === group);

  return (
    <div>
      <Segmented options={groups} active={group} setActive={setGroup} label="Filter solutions" />
      <div className="card-grid mt-8">
        {visible.map((solution) => (
          <Link className="feature-card" key={solution.slug} href={`/solutions/${solution.slug}`}>
            <Icon name={solution.icon} className="h-6 w-6 text-[var(--primary)]" />
            <h3>{solution.shortTitle}</h3>
            <p>{solution.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function IndustrySelector() {
  const groups = ["All", ...Array.from(new Set(industries.map((industry) => industry.group)))];
  const [group, setGroup] = useState("All");
  const visible = group === "All" ? industries : industries.filter((industry) => industry.group === group);

  return (
    <div>
      <Segmented options={groups} active={group} setActive={setGroup} label="Filter industries" />
      <div className="industry-grid mt-8">
        {visible.map((industry) => (
          <Link className="industry-card" key={industry.slug} href={`/industries/${industry.slug}`}>
            <Icon name={industry.icon} className="h-6 w-6" />
            <h3>{industry.title}</h3>
            <p>{industry.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PricingToggle() {
  const [yearly, setYearly] = useState(true);

  return (
    <div>
      <div className="mx-auto flex w-fit rounded-full border border-[var(--border)] bg-white p-1">
        <button className={cn("toggle-pill", !yearly && "active")} type="button" onClick={() => setYearly(false)}>Monthly view</button>
        <button className={cn("toggle-pill", yearly && "active")} type="button" onClick={() => setYearly(true)}>Implementation view</button>
      </div>
      <div className="pricing-grid mt-8">
        {pricingPlans.map((plan) => (
          <article className={cn("pricing-card", plan.highlighted && "highlighted")} key={plan.name}>
            <p className="eyebrow">{plan.audience}</p>
            <h3>{plan.name}</h3>
            <strong>{yearly ? plan.yearly : plan.monthly}</strong>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <ButtonLink href="/demo-request" variant={plan.highlighted ? "primary" : "secondary"}>Discuss Fit</ButtonLink>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FAQAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list">
      {faqs.map((item, index) => (
        <div className="faq-item" key={item.question}>
          <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>
            <span>{item.question}</span>
            <ChevronDown className={cn("h-5 w-5 transition", open === index && "rotate-180")} />
          </button>
          {open === index && <p>{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}

export function ResourceExplorer() {
  const categories = ["All", "ERP Guides", "Case Studies", "Checklists", "Product Updates"];
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const visible = resources.filter((resource) => (category === "All" || resource.category === category) && resource.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="filter-row">
        <Segmented options={categories} active={category} setActive={setCategory} label="Filter resources" />
        <label className="search-field">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search resources</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" />
        </label>
      </div>
      <div className="card-grid mt-8">
        {visible.map((resource) => (
          <Link className="feature-card" href={`/resources/${resource.slug}`} key={resource.slug}>
            <p className="eyebrow">{resource.category}</p>
            <h3>{resource.title}</h3>
            <p>{resource.summary}</p>
            <small>{resource.readingTime}</small>
          </Link>
        ))}
        {!visible.length && <p className="empty-state">No resources match that search yet.</p>}
      </div>
    </div>
  );
}

export function BlogExplorer() {
  const categories = ["All", ...Array.from(new Set(blogPosts.map((post) => post.category)))];
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => category === "All" ? blogPosts : blogPosts.filter((post) => post.category === category), [category]);
  const visible = filtered.slice((page - 1) * 2, page * 2);
  const pages = Math.max(1, Math.ceil(filtered.length / 2));

  return (
    <div>
      <Segmented options={categories} active={category} setActive={(value) => { setCategory(value); setPage(1); }} label="Filter blog" />
      <div className="card-grid mt-8">
        {visible.map((post) => (
          <Link className="feature-card" href={`/blog/${post.slug}`} key={post.slug}>
            <p className="eyebrow">{post.category}</p>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <small>{post.readingTime}</small>
          </Link>
        ))}
      </div>
      <div className="pagination" aria-label="Blog pagination">
        {Array.from({ length: pages }, (_, index) => (
          <button key={index + 1} type="button" className={cn(page === index + 1 && "active")} onClick={() => setPage(index + 1)}>{index + 1}</button>
        ))}
      </div>
    </div>
  );
}

function Segmented({ options, active, setActive, label }: { options: string[]; active: string; setActive: (value: string) => void; label: string }) {
  return (
    <div className="segmented" aria-label={label}>
      {options.map((option) => (
        <button key={option} className={cn(active === option && "active")} type="button" onClick={() => setActive(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}
