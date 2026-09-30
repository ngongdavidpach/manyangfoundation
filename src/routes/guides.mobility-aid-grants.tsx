import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://manyangdisabilityfoundation.org/guides/mobility-aid-grants";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is a mobility aid grant?",
    a: "A mobility aid grant is funding or in-kind support that helps a person with a disability obtain equipment such as a wheelchair, walker, crutches, prosthetic, or assistive device they could not otherwise afford.",
  },
  {
    q: "Who is eligible to apply?",
    a: "Eligibility typically requires a documented disability or mobility impairment, demonstrated financial need, and a recommendation from a clinician or rehabilitation worker. The Manyang Disability Foundation prioritises applicants in underserved communities across South Sudan and the diaspora.",
  },
  {
    q: "How much does a typical grant cover?",
    a: "Grants range from small repair vouchers (~USD 30) to a full custom wheelchair and fitting package (USD 300–800). Where partial funding is available, we try to match the balance through partner organisations.",
  },
  {
    q: "What documents do I need to apply?",
    a: "A completed request form, a clinician or physiotherapist letter confirming the mobility need, a photo ID, and (when possible) measurements or a recent assessment. If you cannot obtain medical paperwork, our intake team can refer you to a partner clinic.",
  },
  {
    q: "How long does the application take?",
    a: "Most applications receive a decision within 3–6 weeks. Custom-fitted equipment can take an additional 4–8 weeks to manufacture and deliver.",
  },
  {
    q: "Do I have to repay the grant?",
    a: "No. Mobility aid grants are gifts, not loans. We do ask recipients to share periodic updates so donors can see their impact.",
  },
  {
    q: "Can family members or carers apply on someone's behalf?",
    a: "Yes. A parent, guardian, carer, or social worker may complete the request on behalf of a child or adult who cannot apply themselves.",
  },
  {
    q: "What if my application is declined?",
    a: "We will explain the reason and, where possible, refer you to a partner programme. You are welcome to reapply once circumstances change or additional documentation is available.",
  },
];

export const Route = createFileRoute("/guides/mobility-aid-grants")({
  head: () => ({
    meta: [
      { title: "Mobility Aid Grants: Eligibility & How to Apply — MDF" },
      {
        name: "description",
        content:
          "A complete guide to mobility aid grants: what they cover, who qualifies, required documents, timelines, and how to apply through the Manyang Disability Foundation.",
      },
      { property: "og:title", content: "Mobility Aid Grants: Eligibility & How to Apply" },
      {
        property: "og:description",
        content:
          "Wheelchairs, walkers, prosthetics and assistive devices — how to apply for a mobility aid grant.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "Manyang Disability Foundation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Mobility Aid Grants: Eligibility & How to Apply" },
      {
        name: "twitter:description",
        content:
          "Wheelchairs, walkers, prosthetics and assistive devices — how to apply for a mobility aid grant.",
      },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Mobility Aid Grants: Eligibility & How to Apply",
          description:
            "A complete guide to mobility aid grants: eligibility, documents, process, and timelines.",
          author: {
            "@type": "Organization",
            name: "Manyang Disability Foundation",
            url: "https://manyangdisabilityfoundation.org/",
          },
          publisher: {
            "@type": "Organization",
            name: "Manyang Disability Foundation",
          },
          mainEntityOfPage: URL,
        }),
      },
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
  component: MobilityAidGrantsPage,
});

function MobilityAidGrantsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-slate prose-headings:font-extrabold prose-h1:text-slate-900 prose-a:text-blue-700">
      <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider mb-3">
        Guide
      </span>
      <h1>Mobility Aid Grants: Eligibility & How to Apply</h1>
      <p className="lead text-slate-600">
        Mobility aid grants help people with disabilities access the wheelchairs, walkers,
        prosthetics, and assistive devices they need to live, learn, and work. This guide explains
        what these grants typically cover, who qualifies, and how to apply through the Manyang
        Disability Foundation.
      </p>

      <h2>What a mobility aid grant covers</h2>
      <ul>
        <li>Manual and all-terrain wheelchairs, including custom seating</li>
        <li>Walkers, crutches, canes, and standing frames</li>
        <li>Prosthetic limbs and orthotic braces</li>
        <li>Wheelchair repair parts and replacement tyres</li>
        <li>Assistive learning devices for inclusive classrooms</li>
      </ul>

      <h2>Who is eligible</h2>
      <p>
        Grants are awarded to individuals with a documented disability or mobility impairment who
        face financial hardship. Priority is given to children, women, and people living in
        underserved areas. See our <Link to="/programs">programs</Link> page for the communities we
        currently serve.
      </p>

      <h2>How to apply</h2>
      <ol>
        <li>
          Complete the online <Link to="/request">Request Aid form</Link> with the applicant's
          contact details and a brief description of the mobility need.
        </li>
        <li>
          Upload a clinician or physiotherapist letter, a photo ID, and (when possible) recent
          measurements.
        </li>
        <li>Our intake team reviews the request and may contact you for a short assessment call.</li>
        <li>
          Approved applicants are matched to a funded device or referred to a partner programme.
        </li>
      </ol>

      <h2>Required documents</h2>
      <ul>
        <li>Clinical letter confirming the mobility need</li>
        <li>Photo ID for the applicant (or guardian, for minors)</li>
        <li>Proof of address or community reference</li>
        <li>Recent measurements or assessment notes, where available</li>
      </ul>

      <h2>Timeline</h2>
      <p>
        Most decisions are issued within 3–6 weeks. Custom-fitted equipment can take a further 4–8
        weeks to manufacture and deliver. Urgent post-surgical or paediatric cases are fast-tracked
        where possible.
      </p>

      <h2>Frequently asked questions</h2>
      <dl className="space-y-5">
        {FAQS.map((f) => (
          <div key={f.q}>
            <dt className="font-bold text-slate-900">{f.q}</dt>
            <dd className="text-slate-600 mt-1">{f.a}</dd>
          </div>
        ))}
      </dl>

      <h2>Related resources</h2>
      <ul>
        <li>
          <Link to="/guides/free-medical-equipment">
            Where to find free medical equipment near you
          </Link>
        </li>
        <li>
          <Link to="/guides/donate-supplies">Where to donate used medical equipment</Link>
        </li>
        <li>
          <Link to="/faq/donations">Donation FAQ — common questions answered</Link>
        </li>
        <li>
          <Link to="/donate">Support a mobility aid grant with a donation</Link>
        </li>
      </ul>
    </article>
  );
}
