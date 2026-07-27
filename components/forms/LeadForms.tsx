"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { submitCareer } from "@/src/services/career.service";
import { submitContact } from "@/src/services/contact.service";
import { submitDemoRequest } from "@/src/services/demo.service";
import { subscribeNewsletter } from "@/src/services/newsletter.service";

type Errors = Record<string, string>;

const email = z.string().trim().email("Enter a valid email address.");
const phone = z.string().trim().min(6, "Enter a valid phone number.");
const required = (label: string) => z.string().trim().min(2, `${label} is required.`);

const demoSchema = z.object({
  fullName: required("Full name"),
  workEmail: email,
  phone,
  companyName: required("Company name"),
  jobTitle: required("Job title"),
  country: required("Country"),
  industry: required("Industry"),
  companySize: required("Company size"),
  requiredSolutions: z.array(z.string()).min(1, "Select at least one solution."),
  preferredContact: required("Preferred contact method"),
  message: z.string().trim().min(10, "Tell us a little about your needs."),
  consent: z.literal(true, { error: "Consent is required." }),
});

const contactSchema = z.object({
  fullName: required("Full name"),
  email,
  phone,
  reason: required("Contact reason"),
  subject: required("Subject"),
  message: z.string().trim().min(10, "Message is required."),
});

const careerSchema = z.object({
  fullName: required("Full name"),
  email,
  phone,
  position: required("Position"),
  portfolioUrl: z.string().trim().optional(),
  linkedInUrl: z.string().trim().optional(),
  coverMessage: z.string().trim().min(10, "Cover message is required."),
  consent: z.literal(true, { error: "Consent is required." }),
});

const newsletterSchema = z.object({ email });

export function DemoRequestForm({ compact = false }: { compact?: boolean }) {
  const form = useForm<Record<string, unknown>>({ defaultValues: { requiredSolutions: [] as string[], consent: false } });
  const [state, setState] = useFormState();

  async function onSubmit(values: Record<string, unknown>) {
    setState({ status: "loading", errors: {} });
    const parsed = demoSchema.safeParse(values);
    if (!parsed.success) return setState({ status: "error", errors: flattenErrors(parsed.error) });
    const result = await submitDemoRequest(parsed.data);
    setState(result.ok ? { status: "success", message: "Demo request received. The Bizovix team can now review your context.", errors: {} } : { status: "error", errors: { form: result.error } });
    if (result.ok) form.reset();
  }

  return (
    <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Status state={state} />
      <Field label="Full name" error={state.errors.fullName}><input autoComplete="name" {...form.register("fullName")} /></Field>
      <Field label="Work email" error={state.errors.workEmail}><input type="email" autoComplete="email" inputMode="email" {...form.register("workEmail")} /></Field>
      <Field label="Phone" error={state.errors.phone}><input type="tel" autoComplete="tel" inputMode="tel" {...form.register("phone")} /></Field>
      {!compact && <Field label="Company name" error={state.errors.companyName}><input autoComplete="organization" {...form.register("companyName")} /></Field>}
      {!compact && <Field label="Job title" error={state.errors.jobTitle}><input autoComplete="organization-title" {...form.register("jobTitle")} /></Field>}
      {!compact && <Field label="Country" error={state.errors.country}><input autoComplete="country-name" {...form.register("country")} /></Field>}
      <Field label="Industry" error={state.errors.industry}>
        <select {...form.register("industry")} defaultValue="">
          <option value="" disabled>Select industry</option>
          {["Manufacturing", "Garments and Textile", "Pharmaceuticals", "Wholesale and Distribution", "Retail and POS", "Construction"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </Field>
      <Field label="Company size" error={state.errors.companySize}>
        <select {...form.register("companySize")} defaultValue="">
          <option value="" disabled>Select size</option>
          {["1-20", "21-100", "101-500", "501-1000", "1000+"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </Field>
      <fieldset className="md:col-span-2">
        <legend>Required solutions</legend>
        <div className="checkbox-grid">
          {["Accounting", "Purchase", "Inventory", "Manufacturing", "Sales", "POS", "HR and Payroll", "Client and Vendor"].map((item) => (
            <label key={item} className="check-row"><input type="checkbox" value={item} {...form.register("requiredSolutions")} />{item}</label>
          ))}
        </div>
        {state.errors.requiredSolutions && <p className="field-error">{state.errors.requiredSolutions}</p>}
      </fieldset>
      <Field label="Preferred contact method" error={state.errors.preferredContact}>
        <select {...form.register("preferredContact")} defaultValue="">
          <option value="" disabled>Select method</option>
          <option>Email</option>
          <option>Phone</option>
          <option>WhatsApp</option>
        </select>
      </Field>
      <Field label="Message" error={state.errors.message} wide><textarea rows={4} {...form.register("message")} /></Field>
      <label className="check-row md:col-span-2"><input type="checkbox" {...form.register("consent")} />I agree to be contacted about Bizovix ERP.</label>
      {state.errors.consent && <p className="field-error md:col-span-2">{state.errors.consent}</p>}
      <Button className="md:col-span-2" type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Submitting..." : "Request Demo"}</Button>
    </form>
  );
}

export function ContactForm() {
  const form = useForm<Record<string, unknown>>();
  const [state, setState] = useFormState();

  async function onSubmit(values: Record<string, unknown>) {
    setState({ status: "loading", errors: {} });
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) return setState({ status: "error", errors: flattenErrors(parsed.error) });
    const result = await submitContact(parsed.data);
    setState(result.ok ? { status: "success", message: "Message received. We will route it to the right team.", errors: {} } : { status: "error", errors: { form: result.error } });
    if (result.ok) form.reset();
  }

  return (
    <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Status state={state} />
      <Field label="Full name" error={state.errors.fullName}><input autoComplete="name" {...form.register("fullName")} /></Field>
      <Field label="Email" error={state.errors.email}><input type="email" autoComplete="email" inputMode="email" {...form.register("email")} /></Field>
      <Field label="Phone" error={state.errors.phone}><input type="tel" autoComplete="tel" inputMode="tel" {...form.register("phone")} /></Field>
      <Field label="Contact reason" error={state.errors.reason}><select {...form.register("reason")} defaultValue=""><option value="" disabled>Select reason</option><option>Sales</option><option>Support</option><option>Partnership</option><option>Career</option></select></Field>
      <Field label="Subject" error={state.errors.subject} wide><input {...form.register("subject")} /></Field>
      <Field label="Message" error={state.errors.message} wide><textarea rows={5} {...form.register("message")} /></Field>
      <Button className="md:col-span-2" type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Sending..." : "Send Message"}</Button>
    </form>
  );
}

export function CareerForm() {
  const form = useForm<Record<string, unknown>>({ defaultValues: { consent: false } });
  const [state, setState] = useFormState();

  async function onSubmit(values: Record<string, unknown>) {
    setState({ status: "loading", errors: {} });
    const parsed = careerSchema.safeParse(values);
    if (!parsed.success) return setState({ status: "error", errors: flattenErrors(parsed.error) });
    const result = await submitCareer(parsed.data);
    setState(result.ok ? { status: "success", message: "Application details received. The careers team can review your profile.", errors: {} } : { status: "error", errors: { form: result.error } });
    if (result.ok) form.reset();
  }

  return (
    <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Status state={state} />
      <Field label="Full name" error={state.errors.fullName}><input autoComplete="name" {...form.register("fullName")} /></Field>
      <Field label="Email" error={state.errors.email}><input type="email" autoComplete="email" inputMode="email" {...form.register("email")} /></Field>
      <Field label="Phone" error={state.errors.phone}><input type="tel" autoComplete="tel" inputMode="tel" {...form.register("phone")} /></Field>
      <Field label="Position" error={state.errors.position}><input {...form.register("position")} /></Field>
      <Field label="Portfolio URL" error={state.errors.portfolioUrl}><input type="url" inputMode="url" {...form.register("portfolioUrl")} /></Field>
      <Field label="LinkedIn URL" error={state.errors.linkedInUrl}><input type="url" inputMode="url" {...form.register("linkedInUrl")} /></Field>
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted-foreground)] md:col-span-2">
        CV upload placeholder. File upload connects when the career backend is available.
      </div>
      <Field label="Cover message" error={state.errors.coverMessage} wide><textarea rows={5} {...form.register("coverMessage")} /></Field>
      <label className="check-row md:col-span-2"><input type="checkbox" {...form.register("consent")} />I agree to be contacted about this application.</label>
      {state.errors.consent && <p className="field-error md:col-span-2">{state.errors.consent}</p>}
      <Button className="md:col-span-2" type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Submitting..." : "Submit Application"}</Button>
    </form>
  );
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const form = useForm<Record<string, unknown>>();
  const [state, setState] = useFormState();

  async function onSubmit(values: Record<string, unknown>) {
    setState({ status: "loading", errors: {} });
    const parsed = newsletterSchema.safeParse(values);
    if (!parsed.success) return setState({ status: "error", errors: flattenErrors(parsed.error) });
    const result = await subscribeNewsletter(parsed.data);
    setState(result.ok ? { status: "success", message: "Subscribed.", errors: {} } : { status: "error", errors: { form: result.error } });
    if (result.ok) form.reset();
  }

  return (
    <form className={compact ? "flex flex-col gap-3" : "form-grid"} onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Status state={state} compact />
      <Field label="Email" error={state.errors.email} wide={compact}>
        <input type="email" autoComplete="email" inputMode="email" {...form.register("email")} />
      </Field>
      <Button type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Joining..." : "Subscribe"}</Button>
    </form>
  );
}

function Field({ label, children, error, wide = false }: { label: string; children: React.ReactNode; error?: string; wide?: boolean }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <label className={wide ? "field md:col-span-2" : "field"} htmlFor={id}>
      <span>{label}</span>
      {children}
      {error && <p className="field-error">{error}</p>}
    </label>
  );
}

type FormState = { status: "idle" | "loading" | "success" | "error"; message?: string; errors: Errors };

function useFormState() {
  return useState<FormState>({ status: "idle", errors: {} });
}

function Status({ state, compact = false }: { state: FormState; compact?: boolean }) {
  if (state.status === "idle" || state.status === "loading") return null;
  const text = state.status === "success" ? state.message : state.errors.form || "Please review the highlighted fields.";
  return (
    <div role={state.status === "error" ? "alert" : "status"} className={`${compact ? "" : "md:col-span-2"} rounded-xl border px-4 py-3 text-sm ${state.status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
      {text}
    </div>
  );
}

function flattenErrors(error: z.ZodError): Errors {
  const errors: Errors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key) errors[key] = issue.message;
  }
  return errors;
}
