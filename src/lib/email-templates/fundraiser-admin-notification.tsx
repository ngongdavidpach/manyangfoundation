import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props {
  fullName?: string;
  email?: string;
  phone?: string;
  state?: string;
  city?: string;
  eventType?: string;
  eventDate?: string;
  fundraisingGoal?: string;
  linkedEvent?: string;
  message?: string;
}

const Email = (p: Props) => (
  <Shell preview="New Australian fundraiser sign-up">
    <Heading style={styles.h1}>New fundraiser sign-up</Heading>
    <Text style={styles.p}><b>{p.fullName}</b> ({p.state}{p.city ? `, ${p.city}` : ""}) signed up.</Text>
    <Text style={styles.p}>Email: {p.email}<br/>Phone: {p.phone || "—"}</Text>
    <Text style={styles.p}>Event: {p.eventType || "—"} · {p.eventDate || "no date"}</Text>
    {p.linkedEvent && <Text style={styles.p}>Linked event: {p.linkedEvent}</Text>}
    <Text style={styles.p}>Goal (AUD): {p.fundraisingGoal || "—"}</Text>
    {p.message && <Text style={styles.small}>Message: {p.message}</Text>}
    <Text style={styles.small}>Review in the Admin Dashboard → People → Fundraisers.</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (d) => `New fundraiser: ${d.fullName || "sign-up"}`,
  displayName: "Fundraiser admin notification",
  to: "partnerships@manyangdisabilityfoundation.org",
  previewData: {
    fullName: "Sam Taylor",
    email: "sam@example.com",
    state: "NSW",
    city: "Sydney",
    eventType: "Run / walk",
    eventDate: "2026-09-12",
    fundraisingGoal: "$8,000",
  },
} satisfies TemplateEntry;
