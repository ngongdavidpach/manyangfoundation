import * as React from "react";
import { Heading, Text, Link } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles, BRAND } from "./_shared";

interface Props {
  email?: string;
  deletedAt?: string;
  supportEmail?: string;
  supportPhone?: string;
}

const Email = ({
  email = "your account",
  deletedAt = "today",
  supportEmail = "info@manyangdisabilityfoundation.org",
  supportPhone = "+1 (555) 382-9104",
}: Props) => (
  <Shell preview="Your MDF account has been permanently deleted">
    <Heading style={styles.h1}>Your account has been deleted</Heading>
    <Text style={styles.p}>Hi,</Text>
    <Text style={styles.p}>
      As requested, the Manyang Disability Foundation account for{" "}
      <strong>{email}</strong> was permanently deleted on <strong>{deletedAt}</strong>.
      All associated sign-in credentials, staff profile data and role assignments have
      been removed.
    </Text>
    <Text style={styles.p}>
      If you did not request this deletion, or if you need help recovering access,
      please contact our support team as soon as possible:
    </Text>
    <Text style={styles.p}>
      Email:{" "}
      <Link
        href={`mailto:${supportEmail}`}
        style={{ color: BRAND.primary, fontWeight: 700 }}
      >
        {supportEmail}
      </Link>
      <br />
      Phone: {supportPhone}
    </Text>
    <Text style={styles.small}>
      Thank you for supporting Manyang Disability Foundation. We're sorry to see you go.
    </Text>
    <Text style={styles.small}>— The MDF Team</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: "Your MDF account has been deleted",
  displayName: "Account deletion confirmed",
  previewData: {
    email: "user@example.com",
    deletedAt: "11 September 2026",
    supportEmail: "info@manyangdisabilityfoundation.org",
    supportPhone: "+1 (555) 382-9104",
  },
} satisfies TemplateEntry;
