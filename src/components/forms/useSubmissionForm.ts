"use client";

import { useCallback, useRef, useState } from "react";
import type { z } from "zod";
import type { SubmissionResponse } from "@/lib/forms";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Form state for schema-validated submissions:
 *  - validates on blur (after first touch) and on submit with the same zod
 *    schema the API uses
 *  - moves focus to the first invalid field on a failed submit
 *  - maps server-side field errors back onto fields
 */
export function useSubmissionForm<S extends z.ZodType<Record<string, unknown>>>(
  schema: S,
  initial: Record<string, string>,
  /** Sends the validated values; see sendForm in @/lib/outgoing. */
  send: (values: Record<string, string>) => Promise<SubmissionResponse>,
) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fieldErrorsFor = useCallback(
    (next: Record<string, string>) => {
      const parsed = schema.safeParse(next);
      const out: Record<string, string> = {};
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const key = issue.path[0];
          if (typeof key === "string" && !out[key]) out[key] = issue.message;
        }
      }
      return out;
    },
    [schema],
  );

  /** Updates several fields in one render (e.g. a choice that clears a dependent field). */
  const setFields = (patch: Record<string, string>) => {
    const next = { ...values, ...patch };
    setValues(next);
    const names = Object.keys(patch).filter((n) => touched[n]);
    if (names.length > 0) {
      const all = fieldErrorsFor(next);
      setErrors((prev) => ({ ...prev, ...Object.fromEntries(names.map((n) => [n, all[n] ?? ""])) }));
    }
  };

  const setField = (name: string, value: string) => setFields({ [name]: value });

  const blurField = (name: string) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const all = fieldErrorsFor(values);
    setErrors((prev) => ({ ...prev, [name]: all[name] ?? "" }));
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs).find((k) => errs[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setFormError(null);

    const errs = fieldErrorsFor(values);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setStatus("error");
      setFormError("Please correct the highlighted fields.");
      focusFirstError(errs);
      return;
    }

    setErrors({});
    setStatus("submitting");
    const res = await send(values);
    if (res.ok) {
      setReference(res.reference);
      setStatus("success");
      return;
    }
    setStatus("error");
    setFormError(res.error);
    if (res.fieldErrors) {
      setErrors(res.fieldErrors);
      focusFirstError(res.fieldErrors);
    }
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setFormError(null);
    setReference(null);
  };

  return {
    values,
    errors,
    status,
    formError,
    reference,
    formRef,
    setField,
    setFields,
    blurField,
    onSubmit,
    reset,
  };
}
