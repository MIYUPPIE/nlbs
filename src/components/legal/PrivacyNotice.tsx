import Link from "next/link";
import { PRIVACY_PATHS } from "@/lib/privacy";

/**
 * The notice shown where personal data is collected (NDPA): what for, and
 * where the full policy is. One line under each form's submit area.
 */
export function PrivacyNotice({
  purpose,
  id,
  className,
}: {
  purpose: string;
  id?: string;
  className?: string;
}) {
  return (
    <p id={id} className={className ?? "max-w-sm text-xs leading-relaxed text-muted"}>
      {purpose} See our{" "}
      <Link href={PRIVACY_PATHS.privacy} className="text-navy-700 underline underline-offset-2">
        Privacy Policy
      </Link>{" "}
      for how we use and protect your data and your rights.
    </p>
  );
}
