import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rateLimit.server";
import { requireStaffOrAdmin } from "@/integrations/supabase/admin-middleware";

const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

// ---------- aid_requests ----------
const aidRequestSchema = z.object({
  fullName: str(120).min(1),
  age: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .pipe(z.number().int().min(0).max(130).nullable()),
  gender: optStr(40),
  country: optStr(80),
  city: optStr(120),
  phone: optStr(40),
  email: z
    .string()
    .trim()
    .max(255)
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  isCaregiver: optStr(20),
  caregiverName: optStr(120),
  disabilityCategory: optStr(60),
  requestedAid: optStr(60),
  hasExistingDevice: optStr(10),
  deviceCondition: optStr(500),
  urgencyLevel: optStr(20),
  story: str(4000).min(30),
});

export const submitAidRequest = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof aidRequestSchema>) => aidRequestSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "aid-request", max: 5, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    const tracking_code = `MDF-AID-${year}-${rand}`;
    const { error } = await supabaseAdmin.from("aid_requests").insert({
      tracking_code,
      full_name: data.fullName,
      age: data.age,
      gender: data.gender,
      country: data.country,
      city: data.city,
      phone: data.phone,
      email: data.email ?? null,
      is_caregiver: data.isCaregiver,
      caregiver_name: data.caregiverName,
      disability_category: data.disabilityCategory,
      requested_aid: data.requestedAid,
      has_existing_device: data.hasExistingDevice,
      device_condition: data.deviceCondition,
      urgency_level: data.urgencyLevel,
      story: data.story,
    });
    if (error) {
      console.error("[submitAidRequest]", error);
      throw new Error("Unable to submit your request. Please try again later.");
    }
    return { tracking_code };
  });

// ---------- event_rsvps ----------
const rsvpSchema = z.object({
  eventExternalId: optStr(80),
  eventTitle: str(200).min(1),
  fullName: str(120).min(1),
  email: z.string().trim().max(255).email(),
  phone: optStr(40),
});

export const submitEventRsvp = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof rsvpSchema>) => rsvpSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "event-rsvp", max: 10, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("event_rsvps")
      .insert({
        event_external_id: data.eventExternalId,
        event_title: data.eventTitle,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
      })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error("[submitEventRsvp]", error);
      throw new Error("Unable to record your RSVP. Please try again later.");
    }

    // Look up event details for the confirmation email (best-effort).
    let eventDate: string | null = null;
    let eventLocation: string | null = null;
    if (data.eventExternalId) {
      const { data: ev } = await supabaseAdmin
        .from("events")
        .select("starts_at, location")
        .eq("id", data.eventExternalId)
        .maybeSingle();
      if (ev?.starts_at) {
        eventDate = new Date(ev.starts_at).toLocaleString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      }
      eventLocation = ev?.location ?? null;
    }

    const { enqueueTransactionalEmail } = await import("@/lib/email/queue.server");
    await enqueueTransactionalEmail({
      templateName: "event-rsvp-confirmation",
      recipientEmail: data.email,
      idempotencyKey: `event-rsvp-${inserted.id}`,
      templateData: {
        fullName: data.fullName,
        eventTitle: data.eventTitle,
        eventDate,
        eventLocation,
      },
    }).catch((e) => console.error("[event-rsvp-confirmation email]", e));

    return { ok: true };
  });

// ---------- volunteer_applications ----------
const volunteerSchema = z.object({
  fullName: str(120).min(1),
  email: z.string().trim().max(255).email(),
  phone: optStr(40),
  country: optStr(80),
  city: optStr(120),
  skills: z.array(z.string().trim().max(40)).max(20).default([]),
  availability: optStr(40),
  message: optStr(1000),
});

export const submitVolunteerApplication = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof volunteerSchema>) => volunteerSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "volunteer-app", max: 5, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("volunteer_applications").insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      city: data.city,
      skills: data.skills,
      availability: data.availability,
      message: data.message,
    });
    if (error) {
      console.error("[submitVolunteerApplication]", error);
      throw new Error("Unable to submit your application. Please try again later.");
    }
    return { ok: true };
  });

// ---------- partner_inquiries ----------
const partnerSchema = z.object({
  orgName: str(200).min(1),
  contactPerson: str(120).min(1),
  email: z.string().trim().max(255).email(),
  phone: optStr(40),
  orgType: optStr(40),
  partnershipType: optStr(40),
  message: optStr(2000),
});

export const submitPartnerInquiry = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof partnerSchema>) => partnerSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "partner-inq", max: 5, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("partner_inquiries").insert({
      org_name: data.orgName,
      contact_person: data.contactPerson,
      email: data.email,
      phone: data.phone,
      org_type: data.orgType,
      partnership_type: data.partnershipType,
      message: data.message,
    });
    if (error) {
      console.error("[submitPartnerInquiry]", error);
      throw new Error("Unable to submit your inquiry. Please try again later.");
    }
    return { ok: true };
  });

// ---------- donation_intents ----------
const donationIntentSchema = z.object({
  donorName: optStr(120),
  donorEmail: z
    .string()
    .trim()
    .max(255)
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  donorPhone: optStr(40),
  donorCountry: optStr(80),
  isAnonymous: z.boolean().default(false),
  amount: z.number().positive().max(1_000_000),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/)
    .default("USD"),
  frequency: z.enum(["one-time", "monthly"]).default("one-time"),
  channel: z.enum(["bank", "payid", "momo", "paypal"]),
  message: optStr(1000),
});

export const submitDonationIntent = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof donationIntentSchema>) => donationIntentSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "donation-intent", max: 10, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const year = new Date().getFullYear();
    const rand = Math.floor(1000000 + Math.random() * 9000000);
    const reference = `MDF-PLEDGE-${year}-${rand}`;
    const { error } = await supabaseAdmin.from("donation_intents").insert({
      reference,
      donor_name: data.isAnonymous ? null : data.donorName,
      donor_email: data.donorEmail ?? null,
      donor_phone: data.donorPhone,
      donor_country: data.donorCountry,
      is_anonymous: data.isAnonymous,
      amount_cents: Math.round(data.amount * 100),
      currency: data.currency,
      frequency: data.frequency,
      channel: data.channel,
      message: data.message,
    });
    if (error) {
      console.error("[submitDonationIntent]", error);
      throw new Error("Unable to record your pledge. Please try again later.");
    }
    if (data.donorEmail) {
      const defaults = {
        bankName: "Commonwealth Bank",
        accountName: "Manyang M Manyang",
        bsb: "063132",
        accountNumber: "11477543",
        payId: "0434133392",
      };
      const { data: ps } = await supabaseAdmin
        .from("page_settings")
        .select("content")
        .eq("page_key", "donate")
        .maybeSingle();
      const pd = ((ps?.content as any)?.paymentDetails ?? {}) as Record<string, string>;
      const details = { ...defaults, ...Object.fromEntries(Object.entries(pd).filter(([, v]) => v)) };
      const { enqueueTransactionalEmail } = await import("@/lib/email/queue.server");
      await enqueueTransactionalEmail({
        templateName: "donation-pledge-confirmation",
        recipientEmail: data.donorEmail,
        idempotencyKey: `donation-pledge-${reference}`,
        templateData: {
          donorName: data.isAnonymous ? "Supporter" : data.donorName || "Supporter",
          reference,
          amount: new Intl.NumberFormat("en-AU", { style: "currency", currency: data.currency }).format(data.amount),
          channel: data.channel,
          date: new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" }),
          ...details,
        },
      }).catch((e) => console.error("[donation-pledge-confirmation email]", e));
    }
    return { reference };
  });

// ---------- contact_messages ----------
const contactMessageSchema = z.object({
  name: str(100).min(1),
  email: z.string().trim().max(255).email(),
  subject: str(200).min(1),
  message: str(2000).min(1),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof contactMessageSchema>) => contactMessageSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "contact-msg", max: 5, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    if (error) {
      console.error("[submitContactMessage]", error);
      throw new Error("Unable to send your message. Please try again later.");
    }
    return { ok: true };
  });

// ---------- coordinator_registrations (East Africa) ----------
const EAST_AFRICA = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Burundi",
  "South Sudan",
  "Ethiopia",
  "Somalia",
  "DR Congo",
] as const;

const coordinatorSchema = z.object({
  fullName: str(120).min(1),
  email: z.string().trim().max(255).email(),
  phone: optStr(40),
  country: z.enum(EAST_AFRICA),
  region: optStr(120),
  organisation: optStr(160),
  roleTitle: optStr(120),
  yearsExperience: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .pipe(z.number().int().min(0).max(80).nullable()),
  languages: optStr(200),
  aidTypes: z.array(z.string().trim().max(40)).max(10).default([]),
  estimatedBeneficiaries: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .pipe(z.number().int().min(0).max(1_000_000).nullable()),
  notes: optStr(2000),
});

export const submitCoordinatorRegistration = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof coordinatorSchema>) => coordinatorSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "coordinator-reg", max: 5, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("coordinator_registrations")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        region: data.region,
        organisation: data.organisation,
        role_title: data.roleTitle,
        years_experience: data.yearsExperience,
        languages: data.languages,
        aid_types: data.aidTypes,
        estimated_beneficiaries: data.estimatedBeneficiaries,
        notes: data.notes,
      })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error("[submitCoordinatorRegistration]", error);
      throw new Error("Unable to submit your registration. Please try again later.");
    }
    const { enqueueTransactionalEmail } = await import("@/lib/email/queue.server");
    await Promise.all([
      enqueueTransactionalEmail({
        templateName: "coordinator-confirmation",
        recipientEmail: data.email,
        idempotencyKey: `coord-conf-${inserted.id}`,
        templateData: { fullName: data.fullName, country: data.country },
      }),
      enqueueTransactionalEmail({
        templateName: "coordinator-admin-notification",
        idempotencyKey: `coord-admin-${inserted.id}`,
        templateData: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          country: data.country,
          organisation: data.organisation,
          roleTitle: data.roleTitle,
          aidTypes: (data.aidTypes || []).join(", "),
          notes: data.notes,
        },
      }),
    ]).catch((e) => console.error("[coordinator emails]", e));
    return { ok: true };
  });

// ---------- fundraiser_registrations (AU) ----------
const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

const fundraiserSchema = z.object({
  fullName: str(120).min(1),
  email: z.string().trim().max(255).email(),
  phone: optStr(40),
  state: z.enum(AU_STATES),
  city: optStr(120),
  postcode: optStr(10),
  eventType: optStr(60),
  eventDate: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  eventId: z
    .string()
    .trim()
    .uuid()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  expectedParticipants: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .pipe(z.number().int().min(0).max(1_000_000).nullable()),
  fundraisingGoal: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .pipe(z.number().min(0).max(10_000_000).nullable()),
  priorExperience: optStr(1000),
  message: optStr(2000),
});

export const submitFundraiserRegistration = createServerFn({ method: "POST" })
  .validator((data: z.input<typeof fundraiserSchema>) => fundraiserSchema.parse(data))
  .handler(async ({ data }) => {
    await enforceRateLimit({ bucket: "fundraiser-reg", max: 5, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve linked event title (optional)
    let linkedEventTitle: string | null = null;
    if (data.eventId) {
      const { data: ev } = await supabaseAdmin
        .from("events")
        .select("title")
        .eq("id", data.eventId)
        .maybeSingle();
      linkedEventTitle = ev?.title ?? null;
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("fundraiser_registrations")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        state: data.state,
        city: data.city,
        postcode: data.postcode,
        event_type: data.eventType,
        event_date: data.eventDate,
        event_id: data.eventId,
        expected_participants: data.expectedParticipants,
        fundraising_goal_cents:
          data.fundraisingGoal != null ? Math.round(data.fundraisingGoal * 100) : null,
        prior_experience: data.priorExperience,
        message: data.message,
      } as any)
      .select("id")
      .single();
    if (error || !inserted) {
      console.error("[submitFundraiserRegistration]", error);
      throw new Error("Unable to submit your registration. Please try again later.");
    }

    const { enqueueTransactionalEmail } = await import("@/lib/email/queue.server");
    await Promise.all([
      enqueueTransactionalEmail({
        templateName: "fundraiser-confirmation",
        recipientEmail: data.email,
        idempotencyKey: `fund-conf-${inserted.id}`,
        templateData: {
          fullName: data.fullName,
          eventType: data.eventType || "your event",
          state: data.state,
        },
      }),
      enqueueTransactionalEmail({
        templateName: "fundraiser-admin-notification",
        idempotencyKey: `fund-admin-${inserted.id}`,
        templateData: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          state: data.state,
          city: data.city,
          eventType: data.eventType,
          eventDate: data.eventDate,
          linkedEvent: linkedEventTitle,
          fundraisingGoal:
            data.fundraisingGoal != null ? `$${data.fundraisingGoal.toLocaleString()}` : null,
          message: data.message,
        },
      }),
    ]).catch((e) => console.error("[fundraiser emails]", e));

    return { ok: true };
  });

// ---------- admin review actions ----------
const reviewSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approve", "decline"]),
  notes: optStr(2000),
});




export const reviewCoordinatorRegistration = createServerFn({ method: "POST" })
  .middleware([requireStaffOrAdmin])
  .validator((d: z.input<typeof reviewSchema>) => reviewSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const status = data.decision === "approve" ? "approved" : "declined";
    const { data: row, error } = await supabaseAdmin
      .from("coordinator_registrations")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: context.userId,
        review_notes: data.notes,
      } as any)
      .eq("id", data.id)
      .select("full_name, email")
      .single();
    if (error || !row) throw new Error("Update failed");
    if (data.decision === "approve") {
      const { enqueueTransactionalEmail } = await import("@/lib/email/queue.server");
      await enqueueTransactionalEmail({
        templateName: "coordinator-approved",
        recipientEmail: row.email,
        idempotencyKey: `coord-approved-${data.id}`,
        templateData: { fullName: row.full_name },
      }).catch((e) => console.error("[coordinator-approved email]", e));
    }
    return { ok: true, status };
  });

export const reviewFundraiserRegistration = createServerFn({ method: "POST" })
  .middleware([requireStaffOrAdmin])
  .validator((d: z.input<typeof reviewSchema>) => reviewSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const status = data.decision === "approve" ? "approved" : "declined";
    const { data: row, error } = await supabaseAdmin
      .from("fundraiser_registrations")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: context.userId,
        review_notes: data.notes,
      } as any)
      .eq("id", data.id)
      .select("full_name, email, event_type")
      .single();
    if (error || !row) throw new Error("Update failed");
    if (data.decision === "approve") {
      const { enqueueTransactionalEmail } = await import("@/lib/email/queue.server");
      await enqueueTransactionalEmail({
        templateName: "fundraiser-approved",
        recipientEmail: row.email,
        idempotencyKey: `fund-approved-${data.id}`,
        templateData: { fullName: row.full_name, eventType: row.event_type || "your event" },
      }).catch((e) => console.error("[fundraiser-approved email]", e));
    }
    return { ok: true, status };
  });



