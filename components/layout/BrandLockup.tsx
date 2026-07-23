import Link from "next/link";
import { cn } from "@/src/lib/utils";

type BrandLockupProps = {
  href?: string;
  variant?: "default" | "light";
  compact?: boolean;
  className?: string;
};

export function BrandLockup({ href = "/", variant = "default", compact = false, className }: BrandLockupProps) {
  return (
    <Link href={href} className={cn("brand-lockup", variant === "light" && "light", className)} aria-label="Bizovix home">
      <img
        src="/brand/bizovix-logo-nav.png"
        alt="Bizovix"
        width={460}
        height={139}
        loading={variant === "default" ? "eager" : "lazy"}
        decoding="async"
        className="brand-logo-image"
      />
    </Link>
  );
}
