import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props {
  fullName?: string;
  eventType?: string;
  state?: string;
}

const Email = ({ fullName = "there", eventType = "your event", state = "Australia" }: Props) => (
  <Shell preview="Welcome to MDF fundraisers — Australia">
    <Heading style={styles.h1}>You're signed up</Heading>
    <Text style={styles.p}>Hi {fullName},</Text>
    <Text style={styles.p}>
      Thanks for signing up to fundraise for the Manyang Disability Foundation in {state}.
      Our Sydney team will contact you within 5 business days with a fundraiser kit and
      support for your {eventType.toLowerCase()}.
    </Text>
    <Text style={styles.p}>
      Every dollar you raise is receipted against ABN 75 986 228 179 and funds mobility-aid
      shipments to East Africa.
    </Text>
    <Text style={styles.small}>— The MDF Fundraising Team</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: "You're signed up to fundraise for MDF",
  displayName: "Fundraiser confirmation",
  previewData: { fullName: "Sam", eventType: "Run / walk", state: "NSW" },
} satisfies TemplateEntry;
