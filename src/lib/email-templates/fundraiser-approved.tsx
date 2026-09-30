import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props { fullName?: string; eventType?: string; }

const Email = ({ fullName = "there", eventType = "your event" }: Props) => (
  <Shell preview="Your fundraiser is approved">
    <Heading style={styles.h1}>Your fundraiser is approved</Heading>
    <Text style={styles.p}>Hi {fullName},</Text>
    <Text style={styles.p}>
      Great news — your {eventType.toLowerCase()} is approved. We'll send your fundraiser
      kit (logos, story templates, donation page link and tax-receipt info) within 48 hours.
    </Text>
    <Text style={styles.small}>— The MDF Fundraising Team</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: "Your MDF fundraiser is approved",
  displayName: "Fundraiser approved",
  previewData: { fullName: "Sam", eventType: "Run / walk" },
} satisfies TemplateEntry;
