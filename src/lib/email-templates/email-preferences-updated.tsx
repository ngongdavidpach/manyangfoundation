import * as React from "react";
import { Heading, Text, Link } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles, BRAND } from "./_shared";

interface Props {
  email?: string;
  updatedAt?: string;
  preferences?: {
    receipts: boolean;
    events: boolean;
    coordinators: boolean;
    fundraisers: boolean;
    account: boolean;
    unsubscribed_all: boolean;
  };
  manageUrl?: string;
}

const LABELS: Record<string, string> = {
  receipts: "Donation receipts",
  events: "Event confirmations & reminders",
  coordinators: "Coordinator program updates",
  fundraisers: "Fundraiser program updates",
  account: "Account notices",
};

const Email = ({
  email = "your account",
  updatedAt = "just now",
  preferences,
  manageUrl = "https://manyangdisabilityfoundation.org/email/preferences",
}: Props) => {
  const p = preferences ?? {
    receipts: true,
    events: true,
    coordinators: true,
    fundraisers: true,
    account: true,
    unsubscribed_all: false,
  };
  return (
    <Shell preview="Your MDF email preferences were updated">
      <Heading style={styles.h1}>Your email preferences were updated</Heading>
      <Text style={styles.p}>Hi,</Text>
      <Text style={styles.p}>
        This is a confirmation that email preferences for <strong>{email}</strong> were
        updated on <strong>{updatedAt}</strong>.
      </Text>
      {p.unsubscribed_all ? (
        <Text style={styles.p}>
          You have unsubscribed from all non-essential emails. Account-security
          messages (sign-in, password reset) will still be sent while your account
          exists.
        </Text>
      ) : (
        <>
          <Text style={styles.p}>Your current selections:</Text>
          <ul style={{ ...styles.p, paddingLeft: 20 }}>
            {Object.keys(LABELS).map((k) => (
              <li key={k}>
                {LABELS[k]}:{" "}
                <strong>{(p as any)[k] ? "On" : "Off"}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
      <Text style={styles.p}>
        You can change these at any time here:{" "}
        <Link href={manageUrl} style={{ color: BRAND.primary, fontWeight: 700 }}>
          Manage email preferences
        </Link>
      </Text>
      <Text style={styles.small}>
        If you did not make this change, please contact us at
        info@manyangdisabilityfoundation.org right away.
      </Text>
      <Text style={styles.small}>— The MDF Team</Text>
    </Shell>
  );
};

export const template = {
  component: Email,
  subject: "Your MDF email preferences were updated",
  displayName: "Email preferences updated",
  previewData: {
    email: "user@example.com",
    updatedAt: "11 September 2026, 3:12pm",
    preferences: {
      receipts: true,
      events: true,
      coordinators: false,
      fundraisers: true,
      account: true,
      unsubscribed_all: false,
    },
    manageUrl: "https://manyangdisabilityfoundation.org/email/preferences",
  },
} satisfies TemplateEntry;
