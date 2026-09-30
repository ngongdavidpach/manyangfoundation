import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

export const BRAND = {
  primary: "#1e3a8a",
  accent: "#d97706",
  text: "#0f172a",
  muted: "#475569",
};

export const styles = {
  body: { backgroundColor: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif", color: BRAND.text },
  container: { maxWidth: 560, margin: "0 auto", padding: "24px 28px" },
  bar: { height: 4, backgroundColor: BRAND.primary, borderRadius: 2, marginBottom: 20 },
  h1: { fontSize: 22, lineHeight: "28px", margin: "0 0 12px", color: BRAND.text },
  p: { fontSize: 14, lineHeight: "22px", color: BRAND.text, margin: "0 0 12px" },
  small: { fontSize: 12, lineHeight: "18px", color: BRAND.muted, margin: "0 0 6px" },
  hr: { borderColor: "#e2e8f0", margin: "20px 0" },
  brand: { fontSize: 13, color: BRAND.muted, margin: 0 },
};

export const Shell: React.FC<{ preview: string; children: React.ReactNode }> = ({
  preview,
  children,
}) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Section style={styles.bar} />
        {children}
        <Hr style={styles.hr} />
        <Text style={styles.brand}>
          Manyang Disability Foundation · ABN 75 986 228 179
        </Text>
        <Text style={styles.small}>
          Registered Australian charity restoring mobility across East Africa.
        </Text>
      </Container>
    </Body>
  </Html>
);
