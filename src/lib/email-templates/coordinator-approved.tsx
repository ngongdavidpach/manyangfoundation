import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props { fullName?: string; }

const Email = ({ fullName = "there" }: Props) => (
  <Shell preview="Your coordinator registration is approved">
    <Heading style={styles.h1}>You're approved</Heading>
    <Text style={styles.p}>Hi {fullName},</Text>
    <Text style={styles.p}>
      Your coordinator registration has been approved. Welcome to the MDF field network.
      A programmes officer will follow up within 5 business days to coordinate your first
      aid request and confirm shipment logistics.
    </Text>
    <Text style={styles.small}>— The MDF Programmes Team</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: "You're approved as an MDF local coordinator",
  displayName: "Coordinator approved",
  previewData: { fullName: "Mary" },
} satisfies TemplateEntry;
