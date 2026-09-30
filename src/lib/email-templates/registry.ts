import type { ComponentType } from "react";

import { template as coordinatorConfirmation } from "./coordinator-confirmation";
import { template as coordinatorAdminNotification } from "./coordinator-admin-notification";
import { template as coordinatorApproved } from "./coordinator-approved";
import { template as fundraiserConfirmation } from "./fundraiser-confirmation";
import { template as fundraiserAdminNotification } from "./fundraiser-admin-notification";
import { template as fundraiserApproved } from "./fundraiser-approved";
import { template as eventRsvpConfirmation } from "./event-rsvp-confirmation";
import { template as accountDeletionRequested } from "./account-deletion-requested";
import { template as accountDeletionConfirmed } from "./account-deletion-confirmed";
import { template as emailPreferencesUpdated } from "./email-preferences-updated";
import { template as donationReceipt } from "./donation-receipt";
import { template as donationPledgeConfirmation } from "./donation-pledge-confirmation";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  "coordinator-confirmation": coordinatorConfirmation,
  "coordinator-admin-notification": coordinatorAdminNotification,
  "coordinator-approved": coordinatorApproved,
  "fundraiser-confirmation": fundraiserConfirmation,
  "fundraiser-admin-notification": fundraiserAdminNotification,
  "fundraiser-approved": fundraiserApproved,
  "event-rsvp-confirmation": eventRsvpConfirmation,
  "account-deletion-requested": accountDeletionRequested,
  "account-deletion-confirmed": accountDeletionConfirmed,
  "email-preferences-updated": emailPreferencesUpdated,
  "donation-receipt": donationReceipt,
  "donation-pledge-confirmation": donationPledgeConfirmation,
};
