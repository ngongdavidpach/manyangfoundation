import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://manyangdisabilityfoundation.org/faq/donations";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Are my donations tax deductible?",
    a: "The Manyang Disability Foundation issues an official receipt for every completed gift. Tax deductibility depends on your country of residence — receipts are accepted by tax authorities in countries with reciprocal charity agreements. Please check with a local tax advisor.",
  },
  {
    q: "What payment methods can I use?",
    a: "You can pledge online and complete your gift via verified bank transfer, mobile money, or PayPal. We do not collect card or account numbers on this site; our donor relations team emails secure transfer instructions within 1–2 business days.",
  },
  {
    q: "Can I set up a recurring monthly donation?",
    a: "Yes. Choose the Monthly Sustainer option on the donate page when you pledge. Monthly gifts make it easier for us to plan custom wheelchair builds and ongoing rehabilitation programmes.",
  },
  {
    q: "Can I donate in-kind items instead of money?",
    a: "Yes — we accept gently used wheelchairs, crutches, walkers, and assistive devices. See our guide on where to donate used medical equipment for accepted items, packaging guidelines, and shipping addresses.",
  },
  {
    q: "How much of my donation reaches the people you serve?",
    a: "Over 90% of every direct donation goes to equipment provision, custom fittings, surgical and rehabilitation support, and field healthcare capacity. Operating and compliance costs are covered separately by restricted grants.",
  },
  {
    q: "Can I donate anonymously?",
    a: "Yes. Tick the Anonymous Donor option on the pledge form. Your name will not appear in any public acknowledgement, though we still need a contact email to send your receipt.",
  },
  {
    q: "Will I receive a receipt?",
    a: "Yes. A tax-style receipt is issued by email once your funds are received and reconciled. If you need an additional copy, contact our donor relations team and reference your pledge number.",
  },
  {
    q: "Can I donate from outside South Sudan or Australia?",
    a: "Absolutely. We accept international donations via bank wire and PayPal, with instructions sent in your local time zone. Currency conversion is handled by your bank or PayPal at the prevailing rate.",
  },
  {
    q: "Can I refund or cancel a donation?",
    a: "A pledge is non-binding and can be cancelled before you transfer funds. Completed gifts are refundable in genuine error cases within 30 days — contact us with your pledge reference.",
  },
  {
    q: "Can I direct my donation to a specific program?",
    a: "Yes. In the message field, name the program you would like to support (e.g. mobility aid grants, inclusive education, livelihood micro-grants). Restricted gifts are tracked separately and reported on in our impact updates.",
  },
  {
    q: "Can I volunteer instead of or in addition to donating?",
    a: "Yes. Visit our Get Involved page to register as a volunteer — we welcome clinicians, fundraisers, translators, and community organisers.",
  },
];

export const Route = createFileRoute("/faq/donations")({
  head: () => ({
    meta: [
      { title: "Donation FAQ — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Common questions about donating to the Manyang Disability Foundation: tax deductibility, payment methods, recurring gifts, receipts, in-kind donations, and where the money goes.",
      },
      { property: "og:title", content: "Donation FAQ — Manyang Disability Foundation" },
      {
        property: "og:description",
        content:
          "Answers to the most common questions about donating to the Manyang Disability Foundation.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "Manyang Disability Foundation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Donation FAQ — Manyang Disability Foundation" },
      {
        name: "twitter:description",
        content:
          "Answers to the most common questions about donating to the Manyang Disability Foundation.",
      },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: DonationFAQPage,
});

function DonationFAQPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-slate prose-headings:font-extrabold prose-h1:text-slate-900 prose-a:text-blue-700">
      <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider mb-3">
        Donor Help Centre
      </span>
      <h1>Donation FAQ</h1>
      <p className="lead text-slate-600">
        Common questions people ask before donating to the Manyang Disability Foundation — covering
        eligibility, process, receipts, and where your gift goes.
      </p>

      <dl className="space-y-6 mt-8">
        {FAQS.map((f) => (
          <div key={f.q}>
            <dt className="font-bold text-slate-900 text-lg">{f.q}</dt>
            <dd className="text-slate-600 mt-1">{f.a}</dd>
          </div>
        ))}
      </dl>

      <h2>Ready to give?</h2>
      <p>
        <Link to="/donate">Make a pledge today</Link> or learn how to{" "}
        <Link to="/guides/donate-supplies">donate used medical equipment</Link>. If you are looking
        for support yourself, see our guide to{" "}
        <Link to="/guides/mobility-aid-grants">mobility aid grants</Link> or visit{" "}
        <Link to="/guides/free-medical-equipment">free medical equipment resources</Link>.
      </p>
    </article>
  );
}
