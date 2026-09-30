import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props {
  donorName?: string;
  reference?: string;
  amount?: string;
  channel?: string;
  date?: string;
  bankName?: string;
  accountName?: string;
  bsb?: string;
  accountNumber?: string;
  payId?: string;
}

const Email = ({
  donorName = "Supporter",
  reference = "",
  amount = "",
  channel = "bank",
  date = "",
  bankName,
  accountName,
  bsb,
  accountNumber,
  payId,
}: Props) => (
  <Shell preview={`Your donation pledge ${reference} has been received`}>
    <Heading style={styles.h1}>Thank you for your pledge</Heading>
    <Text style={styles.p}>Hi {donorName},</Text>
    <Text style={styles.p}>
      We've received your donation pledge. Here are the details you submitted:
    </Text>
    <Text style={styles.p}>
      Reference: <strong>{reference}</strong>
      <br />
      Amount: <strong>{amount}</strong>
      <br />
      Payment method: {channel === "payid" ? "PayID" : "Bank transfer"}
      <br />
      Date: {date}
    </Text>
    <Text style={styles.p}>
      To complete your donation, please transfer the amount and use{" "}
      <strong>{reference}</strong> as the payment description.
    </Text>
    {channel === "payid" && payId ? (
      <Text style={styles.p}>
        PayID: <strong>{payId}</strong>
        {accountName ? <><br />Name: {accountName}</> : null}
      </Text>
    ) : (
      <Text style={styles.p}>
        {bankName ? <>Bank: {bankName}<br /></> : null}
        {accountName ? <>Account name: {accountName}<br /></> : null}
        {bsb ? <>BSB: {bsb}<br /></> : null}
        {accountNumber ? <>Account number: {accountNumber}</> : null}
        {payId ? <><br />Or PayID: {payId}</> : null}
      </Text>
    )}
    <Text style={styles.small}>— Manyang Disability Foundation</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your donation pledge ${data.reference ?? ""} is received`.trim(),
  displayName: "Donation pledge confirmation",
  previewData: {
    donorName: "Alex",
    reference: "MDF-PLEDGE-2026-1234567",
    amount: "$50.00",
    channel: "bank",
    date: "29 September 2026",
    bankName: "Commonwealth Bank",
    accountName: "Manyang M Manyang",
    bsb: "063132",
    accountNumber: "11477543",
    payId: "0434133392",
  },
} satisfies TemplateEntry;
