import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props {
  fullName?: string;
  country?: string;
}

const Email = ({ fullName = "there", country = "your region" }: Props) => (
  <Shell preview="We received your coordinator registration">
    <Heading style={styles.h1}>Registration received</Heading>
    <Text style={styles.p}>Hi {fullName},</Text>
    <Text style={styles.p}>
      Thank you for registering as a local aid coordinator for {country}. Our East Africa
      programmes team has received your details and will reach out within 7 business days
      to verify your organisation and discuss next steps.
    </Text>
    <Text style={styles.p}>
      If you need to add information urgently, reply to this email.
    </Text>
    <Text style={styles.small}>— The MDF Programmes Team</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: "We received your coordinator registration",
  displayName: "Coordinator confirmation",
  previewData: { fullName: "Mary", country: "Kenya" },
} satisfies TemplateEntry;
