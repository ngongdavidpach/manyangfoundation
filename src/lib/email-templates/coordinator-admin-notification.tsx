import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  organisation?: string;
  roleTitle?: string;
  aidTypes?: string;
  notes?: string;
}

const Email = (p: Props) => (
  <Shell preview="New coordinator registration">
    <Heading style={styles.h1}>New coordinator registration</Heading>
    <Text style={styles.p}><b>{p.fullName}</b> ({p.country}) submitted a registration.</Text>
    <Text style={styles.p}>Email: {p.email}<br/>Phone: {p.phone || "—"}</Text>
    <Text style={styles.p}>Organisation: {p.organisation || "—"} · {p.roleTitle || "—"}</Text>
    <Text style={styles.p}>Aid types: {p.aidTypes || "—"}</Text>
    {p.notes && <Text style={styles.small}>Notes: {p.notes}</Text>}
    <Text style={styles.small}>Review in the Admin Dashboard → People → Coordinators.</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (d) => `New coordinator: ${d.fullName || "registration"}`,
  displayName: "Coordinator admin notification",
  to: "partnerships@manyangdisabilityfoundation.org",
  previewData: {
    fullName: "Mary Atieno",
    email: "mary@example.org",
    country: "Kenya",
    organisation: "Hope Clinic",
    roleTitle: "Programme lead",
    aidTypes: "Wheelchairs, Rehab supplies",
  },
} satisfies TemplateEntry;
