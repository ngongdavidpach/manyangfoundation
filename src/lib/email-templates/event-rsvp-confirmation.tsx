import * as React from "react";
import { Heading, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { Shell, styles } from "./_shared";

interface Props {
  fullName?: string;
  eventTitle?: string;
  eventDate?: string | null;
  eventLocation?: string | null;
}

const Email = ({
  fullName = "there",
  eventTitle = "our event",
  eventDate,
  eventLocation,
}: Props) => (
  <Shell preview={`Your RSVP for ${eventTitle} is confirmed`}>
    <Heading style={styles.h1}>You're on the list</Heading>
    <Text style={styles.p}>Hi {fullName},</Text>
    <Text style={styles.p}>
      Thank you for RSVPing to <strong>{eventTitle}</strong>. We've saved your spot.
    </Text>
    {(eventDate || eventLocation) && (
      <Text style={styles.p}>
        {eventDate ? <>When: {eventDate}<br /></> : null}
        {eventLocation ? <>Where: {eventLocation}</> : null}
      </Text>
    )}
    <Text style={styles.p}>
      If your plans change, simply reply to this email so we can update our numbers.
    </Text>
    <Text style={styles.small}>— The MDF Events Team</Text>
  </Shell>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your RSVP for ${data.eventTitle ?? "our event"} is confirmed`,
  displayName: "Event RSVP confirmation",
  previewData: {
    fullName: "Alex",
    eventTitle: "MDF Community Walk",
    eventDate: "Saturday, 12 October 2026 at 9:00 AM",
    eventLocation: "Centennial Park, Sydney",
  },
} satisfies TemplateEntry;
