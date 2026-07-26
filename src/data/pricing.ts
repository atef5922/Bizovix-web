export type PricingFeature = {
  label: string;
  included: boolean;
};

export type PricingPlan = {
  name: string;
  audience: string;
  monthlyPrice: string;
  annualPrice: string;
  monthlyNote: string;
  annualNote: string;
  highlighted: boolean;
  features: PricingFeature[];
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    audience: "For small and growing businesses",
    monthlyPrice: "BDT 1,000",
    annualPrice: "BDT 10,200",
    monthlyNote:
      "Up to 1 user and 1 branch. Additional users can be added separately.",
    annualNote:
      "Billed annually with approximately 15% savings compared with monthly billing.",
    highlighted: false,
    features: [
      {
        label: "Customer management",
        included: true,
      },
      {
        label: "Vendor and supplier management",
        included: true,
      },
      {
        label: "Basic inventory management",
        included: true,
      },
      {
        label: "Accounting and finance",
        included: true,
      },
      {
        label: "Purchase management",
        included: true,
      },
      {
        label: "Sales management",
        included: true,
      },
      {
        label: "Point of Sale (POS)",
        included: false,
      },
      {
        label: "HR and payroll",
        included: false,
      },
      {
        label: "E-commerce integrations",
        included: false,
      },
      {
        label: "SMS and email integrations",
        included: true,
      },
      {
        label: "Payment gateway integration",
        included: false,
      },
      {
        label: "Manufacturing",
        included: false,
      },
    ],
  },
  {
    name: "Standard",
    audience: "For established multi-team operations",
    monthlyPrice: "BDT 1,500",
    annualPrice: "BDT 15,300",
    monthlyNote:
      "Up to 3 users and 2 branches. Designed for growing operational teams.",
    annualNote:
      "Billed annually with approximately 15% savings compared with monthly billing.",
    highlighted: true,
    features: [
      {
        label: "Customer management",
        included: true,
      },
      {
        label: "Vendor and supplier management",
        included: true,
      },
      {
        label: "Advanced inventory management",
        included: true,
      },
      {
        label: "Accounting and finance",
        included: true,
      },
      {
        label: "Purchase management",
        included: true,
      },
      {
        label: "Sales management",
        included: true,
      },
      {
        label: "Point of Sale (POS)",
        included: true,
      },
      {
        label: "HR and payroll",
        included: true,
      },
      {
        label: "E-commerce integrations",
        included: false,
      },
      {
        label: "SMS and email integrations",
        included: true,
      },
      {
        label: "Payment gateway integration",
        included: true,
      },
      {
        label: "Manufacturing",
        included: false,
      },
    ],
  },
  {
    name: "Premium",
    audience: "For advanced and production-based businesses",
    monthlyPrice: "BDT 2,000",
    annualPrice: "BDT 20,400",
    monthlyNote:
      "Up to 5 users and 3 branches. Built for advanced operations and production teams.",
    annualNote:
      "Billed annually with approximately 15% savings compared with monthly billing.",
    highlighted: false,
    features: [
      {
        label: "Customer management",
        included: true,
      },
      {
        label: "Vendor and supplier management",
        included: true,
      },
      {
        label: "Advanced inventory management",
        included: true,
      },
      {
        label: "Accounting and finance",
        included: true,
      },
      {
        label: "Purchase management",
        included: true,
      },
      {
        label: "Sales management",
        included: true,
      },
      {
        label: "Point of Sale (POS)",
        included: true,
      },
      {
        label: "HR and payroll",
        included: true,
      },
      {
        label: "E-commerce integrations",
        included: true,
      },
      {
        label: "SMS and email integrations",
        included: true,
      },
      {
        label: "Payment gateway integration",
        included: true,
      },
      {
        label: "Manufacturing",
        included: true,
      },
    ],
  },
];
