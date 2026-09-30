import { createFileRoute, Link } from "@tanstack/react-router";

const LAST_UPDATED = "17 July 2026";
const PRIVACY_EMAIL = "privacy@manyangdisabilityfoundation.org";

export const Route = createFileRoute("/privacy/emails")({
  head: () => ({
    meta: [
      { title: "Email Communications Addendum — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "What emails we send, why we send them, how they are delivered, retention, and how to opt out. Part of the MDF privacy policy.",
      },
      {
        property: "og:title",
        content: "Email Communications Addendum — Manyang Disability Foundation",
      },
      {
        property: "og:description",
        content:
          "The emails MDF sends, their legal basis, delivery, retention and opt-out.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: EmailAddendum,
});

function EmailAddendum() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-slate-800">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          Legal · addendum to the{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Email Communications Addendum
        </h1>
        <p className="text-sm text-slate-600">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 text-sm bg-blue-50 border border-blue-100 text-blue-900 p-3 rounded-lg">
          This page is maintained by Manyang Disability Foundation and describes email
          handling only. It is not an independent certification. See the main{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          for the full context.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Scope</h2>
        <p>
          This addendum explains every category of email the site can send you, on what
          legal basis, how the email is delivered, how long we keep records of it, and how
          you can opt out. It applies to visitors and account holders in the EU, UK,
          Australia and other regions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">2. What we send</h2>

        <h3 className="text-base font-bold text-slate-900 mt-4 mb-2">
          a. Authentication emails
        </h3>
        <p className="mb-2 text-sm">
          Sent to staff and partner account holders only, when required to keep the
          account secure and usable:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Signup confirmation</li>
          <li>Password reset ("recovery")</li>
          <li>Magic sign-in link</li>
          <li>Email-address change confirmation</li>
          <li>Re-authentication challenge</li>
          <li>Invitation to a new account</li>
        </ul>
        <p className="mt-2 text-xs text-slate-600">
          <strong>Legal basis:</strong> performance of a contract / necessity to provide
          the service (GDPR Art. 6(1)(b)). Authentication emails cannot be opted out of
          while you hold an account, because they secure the account.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-6 mb-2">
          b. Transactional emails
        </h3>
        <p className="mb-2 text-sm">
          Sent in response to something you did — never on a schedule and never for
          marketing purposes:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Donation receipts</li>
          <li>Event RSVP confirmations</li>
          <li>Volunteer / coordinator / fundraiser application status updates</li>
          <li>Account-deletion scheduled &amp; account-deletion confirmed notices</li>
          <li>Unsubscribe confirmations</li>
        </ul>
        <p className="mt-2 text-xs text-slate-600">
          <strong>Legal basis:</strong> performance of a contract or our legitimate
          interest in confirming actions you took (GDPR Art. 6(1)(b) or (f)).
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-6 mb-2">
          c. Marketing / newsletters
        </h3>
        <p className="text-sm bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-lg p-3">
          <strong>We do not send marketing emails or newsletters.</strong> If we ever
          introduce them, we will ask for explicit opt-in consent first and update this
          page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          3. How we collect email addresses
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>When you submit a form on the site (contact, RSVP, donation, aid request, etc.).</li>
          <li>When a staff or partner account is created.</li>
          <li>When you reply to us or are cc'd on correspondence you initiated.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">4. How emails are delivered</h2>
        <p className="mb-3 text-sm">
          Emails are rendered on our servers, placed in a queue, and delivered via our
          application platform's email infrastructure. Delivery, bounce and complaint
          events are logged so we can protect deliverability and prove that a message was
          sent when required (for example, receipts).
        </p>
        <p className="text-sm">
          A <strong>suppression list</strong> stores addresses that have hard-bounced,
          complained, or unsubscribed. We check this list before sending transactional
          emails to avoid sending to addresses that should no longer receive mail.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Opting out</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            You can manage individual categories (donation receipts, event confirmations,
            coordinator and fundraiser updates, account notices) via the "Manage
            preferences" link included with any transactional email.
          </li>
          <li>
            Eligible transactional emails include an unsubscribe link. Using it adds your
            address to the suppression list.
          </li>
          <li>
            Authentication emails cannot be individually opted out of — they secure your
            account. To stop all email from us, delete your account from{" "}
            <Link to="/auth/delete-account" className="text-blue-700 underline">
              Delete account
            </Link>{" "}
            or email{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-700 underline">
              {PRIVACY_EMAIL}
            </a>
            .
          </li>
          <li>
            You can also ask us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-700 underline">
              {PRIVACY_EMAIL}
            </a>{" "}
            to add your address to the suppression list without deleting your account.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Retention</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            <strong>Send logs</strong> (who received what and when): retained for one month
            for operational and abuse-prevention purposes, then deleted.
          </li>
          <li>
            <strong>Suppression list</strong>: retained for as long as your address remains
            contactable, so that bounces and unsubscribes continue to be honoured.
          </li>
          <li>
            <strong>Donation receipts</strong>: the underlying donation record is kept for
            the period required by Australian tax and charity law (see the main{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
            ).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your rights</h2>
        <p className="text-sm">
          Your rights of access, rectification, erasure, restriction, objection, and
          portability apply equally to email data. See{" "}
          <Link to="/privacy" className="text-blue-700 underline">
            Your rights
          </Link>{" "}
          in the main policy, or email{" "}
          <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-700 underline">
            {PRIVACY_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact</h2>
        <address className="not-italic text-sm bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="font-semibold text-slate-900">Manyang Disability Foundation</p>
          <p>ABN 75 986 228 179</p>
          <p>Australia</p>
          <p className="mt-2">
            Privacy contact:{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-700 underline">
              {PRIVACY_EMAIL}
            </a>
          </p>
        </address>
      </section>
    </main>
  );
}
