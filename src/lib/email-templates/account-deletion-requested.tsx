import * as React from "react";
import { Heading, Text, Link } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles, BRAND } from "./_shared";

interface Props {
  email?: string;
  purgeAfter?: string; // formatted date
  cancelUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
}

const Email = ({
  email = "your account",
  purgeAfter = "in 30 days",
  cancelUrl = "https://manyangdisabilityfoundation.org",
  supportEmail = "info@manyangdisabilityfoundation.org",
  supportPhone = "+1 (555) 382-9104",
}: Props) => (
  <Shell preview={`Your MDF account is scheduled for deletion on ${purgeAfter}`}>
    <Heading style={styles.h1}>Deletion scheduled</Heading>
    <Text style={styles.p}>Hi,</Text>
    <Text style={styles.p}>
      We received a request to permanently delete the Manyang Disability Foundation
      account for <strong>{email}</strong>. Sign-in has been disabled during this grace
      period.
    </Text>
    <Text style={styles.p}>
      Your account will be <strong>permanently deleted on {purgeAfter}</strong>. Until
      then, you can cancel this request:
    </Text>
    <Text style={styles.p}>
      <Link
        href={cancelUrl}
        style={{ color: BRAND.primary, fontWeight: 700, textDecoration: "underline" }}
      >
        Cancel account deletion
      </Link>
    </Text>
    <Text style={styles.small}>
      If you did not request this, please cancel immediately and contact us at{" "}
      <Link href={`mailto:${supportEmail}`} style={{ color: BRAND.primary }}>
        {supportEmail}
      </Link>{" "}
      or {supportPhone}.
    </Text>
    <Text style={styles.small}>— The MDF Team</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your MDF account is scheduled for deletion on ${data.purgeAfter ?? "in 30 days"}`,
  displayName: "Account deletion requested",
  previewData: {
    email: "user@example.com",
    purgeAfter: "12 August 2026",
    cancelUrl: "https://manyangdisabilityfoundation.org/auth/cancel-deletion?token=demo",
    supportEmail: "info@manyangdisabilityfoundation.org",
    supportPhone: "+1 (555) 382-9104",
  },
} satisfies TemplateEntry;
