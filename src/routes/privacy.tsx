import { createFileRoute, Link } from "@tanstack/react-router";

const LAST_UPDATED = "17 July 2026";
const PRIVACY_EMAIL = "privacy@manyangdisabilityfoundation.org";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "How Manyang Disability Foundation collects, uses and protects personal data, including your rights under the GDPR and the Australian Privacy Act.",
      },
      { property: "og:title", content: "Privacy Policy — Manyang Disability Foundation" },
      {
        property: "og:description",
        content:
          "How we handle personal data, your GDPR/APP rights, retention periods, and how to contact us.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function TOC() {
  const items: Array<[string, string]> = [
    ["who-we-are", "Who we are"],
    ["what-we-collect", "Data we collect"],
    ["legal-bases", "Legal bases for processing"],
    ["how-we-use", "How we use your data"],
    ["emails", "Emails and communications"],
    ["sharing", "Sharing & subprocessors"],
    ["transfers", "International transfers"],
    ["retention", "Retention"],
    ["rights", "Your rights"],
    ["exercise", "How to exercise your rights"],
    ["cookies", "Cookies"],
    ["children", "Children"],
    ["security", "Security"],
    ["changes", "Changes to this policy"],
    ["contact", "Contact us"],
  ];
  return (
    <nav
      aria-label="On this page"
      className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm"
    >
      <p className="font-semibold text-slate-800 mb-2">On this page</p>
      <ol className="list-decimal pl-5 space-y-1 text-slate-700">
        {items.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="hover:underline">
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-slate-800">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
        <p className="text-sm text-slate-600">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 text-sm bg-blue-50 border border-blue-100 text-blue-900 p-3 rounded-lg">
          This page is maintained by Manyang Disability Foundation to describe how we handle
          personal data. It is not an independent certification.
        </p>
      </header>

      <div className="mb-8">
        <TOC />
      </div>

      <section id="who-we-are" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Who we are</h2>
        <p className="mb-3">
          Manyang Disability Foundation ("MDF", "we", "us", "our") is the data controller for
          personal data collected through this website. We are an ACNC-registered charity
          based in Australia (ABN 75 986 228 179) supporting people with disabilities. We
          receive enquiries and support from visitors located in the European Union, the
          United Kingdom, Australia and elsewhere.
        </p>
        <p>
          You can reach our privacy contact at{" "}
          <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-700 underline">
            {PRIVACY_EMAIL}
          </a>{" "}
          or via our{" "}
          <Link to="/contact" className="text-blue-700 underline">
            contact form
          </Link>
          .
        </p>
      </section>

      <section id="what-we-collect" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Data we collect</h2>
        <p className="mb-3">We only collect what we need to run our programs and services:</p>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            <strong>Contact form:</strong> your name, email address, and the message you
            send.
          </li>
          <li>
            <strong>Donations:</strong> your name, email address, donation amount, and — if
            you request a tax receipt — postal address. Payment card details are handled
            directly by our payment processor and never touch our servers.
          </li>
          <li>
            <strong>Event RSVPs:</strong> your name, email address, and any requirements you
            share (dietary, accessibility).
          </li>
          <li>
            <strong>Volunteer, coordinator, fundraiser and aid-request submissions:</strong>{" "}
            the fields you complete on each form (contact details, location, availability,
            and — for aid requests — the information you provide about your need).
          </li>
          <li>
            <strong>Staff / partner accounts:</strong> email address, full name, hashed
            password, role assignments, sign-in timestamps.
          </li>
          <li>
            <strong>Technical logs:</strong> IP address and basic request metadata are
            temporarily processed for security (rate limiting, abuse prevention) and error
            monitoring.
          </li>
        </ul>
      </section>

      <section id="legal-bases" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          3. Legal bases for processing (GDPR)
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            <strong>Consent</strong> (Art. 6(1)(a)) — when you submit a form or RSVP, you
            consent to us using that data to respond.
          </li>
          <li>
            <strong>Contract / steps prior to contract</strong> (Art. 6(1)(b)) — processing
            donations, running your account, sending transactional confirmations.
          </li>
          <li>
            <strong>Legal obligation</strong> (Art. 6(1)(c)) — retaining donation records to
            meet Australian tax and charity-reporting requirements.
          </li>
          <li>
            <strong>Legitimate interests</strong> (Art. 6(1)(f)) — securing the site
            (rate-limiting, spam prevention), keeping short-lived server logs.
          </li>
        </ul>
      </section>

      <section id="how-we-use" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">4. How we use your data</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>To reply to your enquiries and requests.</li>
          <li>To process donations and issue receipts.</li>
          <li>To coordinate volunteering, events, partnerships and aid programs.</li>
          <li>
            To send <strong>transactional and authentication emails only</strong> — we do{" "}
            <strong>not</strong> send marketing emails or newsletters.
          </li>
          <li>To secure the service and prevent abuse.</li>
          <li>To meet our legal and regulatory obligations as an Australian charity.</li>
        </ul>
      </section>

      <section id="emails" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Emails and communications</h2>
        <p>
          We send only authentication emails (for staff accounts) and transactional emails
          (receipts, confirmations, deletion notices). For a detailed breakdown of what we
          send, how it is delivered, retention, and how to opt out, see our{" "}
          <Link to="/privacy/emails" className="text-blue-700 underline">
            Email Communications Addendum
          </Link>
          .
        </p>
      </section>

      <section id="sharing" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Sharing & subprocessors</h2>
        <p className="mb-3">
          We do not sell personal data. We share limited data with service providers that
          help us run the site:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            <strong>Hosting, database and email delivery</strong> — provided by our
            application platform, which stores your data and sends transactional and auth
            emails on our behalf.
          </li>
          <li>
            <strong>Payment processor</strong> — handles donation payments directly;
            payment card details are collected by the processor, not by us.
          </li>
          <li>
            <strong>Australian Charities and Not-for-profits Commission (ACNC)</strong> — as
            required by our regulatory reporting obligations.
          </li>
        </ul>
      </section>

      <section id="transfers" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">7. International transfers</h2>
        <p>
          MDF is based in Australia and our service providers may process data in the
          European Union, the United Kingdom, the United States or other jurisdictions.
          Where personal data of EU/UK residents is transferred outside those regions, we
          rely on the safeguards our providers make available (such as Standard Contractual
          Clauses) and on the adequacy status of Australian charities under applicable law.
          Contact us for details of the safeguards in place.
        </p>
      </section>

      <section id="retention" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">8. Retention</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            <strong>Contact form messages and general communications:</strong> retained for
            one month after the matter is resolved, then deleted.
          </li>
          <li>
            <strong>Donation records:</strong> retained for the period required by
            Australian tax and charity law.
          </li>
          <li>
            <strong>Staff / partner accounts:</strong> retained until you delete your
            account via{" "}
            <Link to="/auth/delete-account" className="text-blue-700 underline">
              Delete account
            </Link>
            . Deletion is subject to a 30-day grace period during which you can cancel;
            after that, the account and its data are permanently removed.
          </li>
          <li>
            <strong>Technical logs:</strong> retained for a short operational window and
            then deleted.
          </li>
        </ul>
      </section>

      <section id="rights" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">9. Your rights</h2>
        <p className="mb-3">
          Depending on where you live, you have some or all of the following rights over
          your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            <strong>Access</strong> — request a copy of the personal data we hold about you.
          </li>
          <li>
            <strong>Rectification</strong> — ask us to correct inaccurate or incomplete data.
          </li>
          <li>
            <strong>Erasure</strong> — ask us to delete your data (subject to legal
            retention duties).
          </li>
          <li>
            <strong>Restriction & objection</strong> — ask us to pause or stop processing
            based on legitimate interests.
          </li>
          <li>
            <strong>Portability</strong> — receive your data in a portable format.
          </li>
          <li>
            <strong>Withdraw consent</strong> — where processing is based on consent, you
            can withdraw it at any time.
          </li>
          <li>
            <strong>Lodge a complaint</strong> — with your local supervisory authority.
          </li>
        </ul>
        <p className="mt-3 text-sm">
          <strong>Supervisory authorities:</strong> Australian residents may contact the{" "}
          <a
            href="https://www.oaic.gov.au/"
            className="text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Office of the Australian Information Commissioner (OAIC)
          </a>
          . EU residents may contact their national data protection authority. UK residents
          may contact the{" "}
          <a
            href="https://ico.org.uk/"
            className="text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Information Commissioner's Office (ICO)
          </a>
          .
        </p>
      </section>

      <section id="exercise" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          10. How to exercise your rights
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>
            Email{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-700 underline">
              {PRIVACY_EMAIL}
            </a>{" "}
            with your request. We aim to respond within 30 days.
          </li>
          <li>
            Account holders can download all data associated with their account and
            schedule permanent deletion from the{" "}
            <Link to="/auth/delete-account" className="text-blue-700 underline">
              Delete account
            </Link>{" "}
            page — no email required.
          </li>
          <li>
            We may ask for reasonable proof of identity before releasing or deleting data.
          </li>
        </ul>
      </section>

      <section id="cookies" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">11. Cookies</h2>
        <p>
          We use only strictly-necessary cookies and local storage entries required to keep
          you signed in and to protect the site from abuse. We do not use advertising
          cookies or third-party analytics that profile visitors.
        </p>
      </section>

      <section id="children" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">12. Children</h2>
        <p>
          This site is not directed at children under 16. We do not knowingly collect
          personal data from children. If you believe a child has provided personal data,
          contact us and we will delete it.
        </p>
      </section>

      <section id="security" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">13. Security</h2>
        <p>
          Access to personal data is restricted to authorised staff and enforced by
          row-level authorisation in our database. Passwords are hashed. We use HTTPS in
          transit. No online service can be guaranteed 100% secure — security is a shared
          responsibility between us and the platform providers we rely on.
        </p>
      </section>

      <section id="changes" className="mb-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">14. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be flagged on
          this page and the "Last updated" date above will be revised. Continued use of the
          site after changes take effect constitutes acceptance of the updated policy.
        </p>
      </section>

      <section id="contact" className="mb-4 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-3">15. Contact us</h2>
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
          <p>
            General:{" "}
            <Link to="/contact" className="text-blue-700 underline">
              contact form
            </Link>
          </p>
        </address>
      </section>
    </main>
  );
}
