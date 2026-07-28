import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "dark";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(buttonClasses(variant), className)} {...props} />;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  download,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
  download?: boolean | string;
}) {
  if (download) {
    return (
      <a className={cn(buttonClasses(variant), className)} href={href} download={download}>
        {children}
      </a>
    );
  }

  return (
    <Link className={cn(buttonClasses(variant), className)} href={href}>
      {children}
    </Link>
  );
}

function buttonClasses(variant: ButtonProps["variant"]) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
    variant === "primary" && "bg-[var(--primary)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--primary-hover)]",
    variant === "secondary" && "border border-[var(--border)] bg-white text-[var(--navy)] shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
    variant === "ghost" && "text-[var(--navy)] hover:bg-[var(--surface-soft)]",
    variant === "dark" && "bg-white text-[var(--navy)] hover:bg-[var(--surface-soft)]",
  );
}
