import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props {
  donorName?: string;
  amount?: string;
  currency?: string;
  frequency?: "one-time" | "monthly";
  designation?: string | null;
  reference?: string | null;
  date?: string | null;
}

const Email = ({
  donorName = "Friend",
  amount = "0.00",
  currency = "AUD",
  frequency = "one-time",
  designation,
  reference,
  date,
}: Props) => (
  <Shell preview={`Thank you for your ${currency} ${amount} donation`}>
    <Heading style={styles.h1}>Thank you for your gift</Heading>
    <Text style={styles.p}>Hi {donorName},</Text>
    <Text style={styles.p}>
      We've received your {frequency === "monthly" ? "monthly " : ""}donation of{" "}
      <strong>
        {currency} {amount}
      </strong>
      . Your support funds mobility aids, rehabilitation and inclusive education for people with
      disabilities.
    </Text>
    <Text style={styles.p}>
      {date ? (
        <>
          Date: {date}
          <br />
        </>
      ) : null}
      {designation ? (
        <>
          Designation: {designation}
          <br />
        </>
      ) : null}
      {reference ? <>Payment reference: {reference}</> : null}
    </Text>
    {frequency === "monthly" ? (
      <Text style={styles.p}>
        This is a recurring monthly gift. You can pause or cancel at any time by replying to this
        email.
      </Text>
    ) : null}
    <Text style={styles.p}>
      A formal tax receipt will follow from our finance team. Please keep this email as your
      confirmation of payment.
    </Text>
    <Text style={styles.small}>— Manyang Disability Foundation</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your donation receipt — ${data.currency ?? "AUD"} ${data.amount ?? ""}`.trim(),
  displayName: "Donation receipt (card)",
  previewData: {
    donorName: "Alex",
    amount: "150.00",
    currency: "AUD",
    frequency: "one-time",
    designation: "Wheelchair fund",
    reference: "pi_123456789",
    date: "13 August 2026",
  },
} satisfies TemplateEntry;
