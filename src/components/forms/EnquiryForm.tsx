"use client";

import { useEffect, useRef } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { enquirySchema, enquiryTopics, type EnquiryTopic } from "@/lib/enquiry";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/forms/Field";
import { useSubmissionForm } from "@/components/forms/useSubmissionForm";
import { useHydrated } from "@/components/hooks/useHydrated";

export function EnquiryForm({ initialTopic }: { initialTopic?: EnquiryTopic | null }) {
  const { formRef, ...form } = useSubmissionForm(
    enquirySchema,
    {
      fullName: "",
      email: "",
      organisation: "",
      topic: initialTopic ?? "",
      message: "",
      website: "",
    },
    "/api/enquiry",
  );
  const successRef = useRef<HTMLHeadingElement>(null);
  // Submit stays disabled until hydrated so a pre-hydration submit cannot fire natively.
  const hydrated = useHydrated();

  useEffect(() => {
    if (form.status === "success") successRef.current?.focus();
  }, [form.status]);

  if (form.status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 sm:p-10">
        <CircleCheck aria-hidden="true" className="size-10 text-gold-ink" />
        <h2 ref={successRef} tabIndex={-1} className="mt-5 font-display text-3xl text-navy-950 outline-none">
          Message received
        </h2>
        <p className="mt-3 text-muted">
          Thank you. The summit team will respond to{" "}
          <strong className="text-navy-950">{form.values.email}</strong>.
        </p>
        <p className="mt-4 text-sm text-muted">
          Reference <span className="font-mono font-semibold text-navy-950">{form.reference}</span>
        </p>
        <button type="button" onClick={form.reset} className={buttonClasses("outline-dark", "md", "mt-8")}>
          Send another message
        </button>
      </div>
    );
  }

  const field = { onChange: form.setField, onBlur: form.blurField };
  const submitting = form.status === "submitting";

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={form.onSubmit}
      className="relative rounded-3xl border border-line bg-white p-6 sm:p-10"
    >
      <h2 className="font-display text-3xl text-navy-950">Send an enquiry</h2>
      <p className="mt-2 text-sm text-muted">Partnership, exhibition, pitch, media and general enquiries.</p>
      {form.formError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{form.formError}</p>
        </div>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <TextField
          name="fullName"
          label="Full Name"
          autoComplete="name"
          required
          value={form.values.fullName}
          error={form.errors.fullName}
          {...field}
        />
        <TextField
          name="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          value={form.values.email}
          error={form.errors.email}
          {...field}
        />
        <TextField
          name="organisation"
          label="Organisation"
          autoComplete="organization"
          value={form.values.organisation}
          error={form.errors.organisation}
          {...field}
        />
        <SelectField
          name="topic"
          label="Topic"
          required
          options={enquiryTopics}
          placeholder="Select a topic"
          value={form.values.topic}
          error={form.errors.topic}
          {...field}
        />
        <TextAreaField
          name="message"
          label="Message"
          required
          value={form.values.message}
          error={form.errors.message}
          className="sm:col-span-2"
          {...field}
        />
      </div>
      <Honeypot value={form.values.website} onChange={(v) => form.setField("website", v)} />
      <button
        type="submit"
        disabled={submitting || !hydrated}
        className={buttonClasses(
          "gold",
          "lg",
          "mt-8 w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto",
        )}
      >
        {submitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send enquiry"
        )}
      </button>
    </form>
  );
}
