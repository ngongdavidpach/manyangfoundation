// Central mapping from template name -> preference category. Auth templates
// (signup, recovery, magic-link, reauthentication, invite, email-change) go
// through the auth webhook and are NOT gated by user preferences — they are
// account-security emails required while an account exists.
export type PrefCategory =
  | "receipts"
  | "events"
  | "coordinators"
  | "fundraisers"
  | "account";

export function categoryForTemplate(templateName: string): PrefCategory | null {
  if (templateName.startsWith("coordinator-") && !templateName.includes("admin-notification"))
    return "coordinators";
  if (templateName.startsWith("fundraiser-") && !templateName.includes("admin-notification"))
    return "fundraisers";
  if (templateName === "event-rsvp-confirmation") return "events";
  if (templateName.startsWith("account-deletion")) return "account";
  // Preference-update confirmation is a direct response to a user action;
  // never gated by preferences (handled with bypassSuppression at the call site).
  if (templateName === "email-preferences-updated") return null;
  if (templateName.includes("receipt")) return "receipts";
  // Admin notifications, contact confirmations, etc. — not user-preference gated.
  return null;
}
