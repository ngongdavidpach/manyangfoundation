import { createFileRoute, Link } from "@tanstack/react-router";
import { useFoundationInfo } from "../ported/hooks/useFoundationInfo";

export const Route = createFileRoute("/guides/donate-supplies")({
  head: () => ({
    meta: [
      { title: "Where to Donate Used Medical Equipment — MDF" },
      {
        name: "description",
        content:
          "Guide to donating used wheelchairs, crutches, and medical supplies to the Manyang Disability Foundation and partner programs.",
      },
      { property: "og:title", content: "Where to Donate Used Medical Equipment" },
      {
        property: "og:description",
        content: "How to donate used wheelchairs, crutches, and medical supplies near you.",
      },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: "https://manyangdisabilityfoundation.org/guides/donate-supplies",
      },
      { property: "og:image", content: "https://manyangdisabilityfoundation.org/images/logo.png" },
      { property: "og:site_name", content: "Manyang Disability Foundation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Where to Donate Used Medical Equipment" },
      {
        name: "twitter:description",
        content: "How to donate used wheelchairs, crutches, and medical supplies near you.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://manyangdisabilityfoundation.org/guides/donate-supplies" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Where to Donate Used Medical Equipment",
          description:
            "Guide to donating used wheelchairs, crutches, and medical supplies to the Manyang Disability Foundation and partner programs.",
          image: "https://manyangdisabilityfoundation.org/images/logo.png",
          author: {
            "@type": "Organization",
            name: "Manyang Disability Foundation",
            url: "https://manyangdisabilityfoundation.org/",
          },
          publisher: {
            "@type": "Organization",
            name: "Manyang Disability Foundation",
            logo: {
              "@type": "ImageObject",
              url: "https://manyangdisabilityfoundation.org/images/logo.png",
            },
          },
          mainEntityOfPage: "https://manyangdisabilityfoundation.org/guides/donate-supplies",
        }),
      },
    ],
  }),
  component: DonateSuppliesGuide,
});

function DonateSuppliesGuide() {
  const { content: FOUNDATION_INFO } = useFoundationInfo();
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-slate">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
        Where to Donate Used Medical Equipment
      </h1>
      <p className="text-slate-600 text-lg mb-8">
        Have a wheelchair, walker, crutches, or other mobility aid you no longer need? Your
        equipment can transform someone's life. Here's how to donate used medical supplies to the
        Manyang Disability Foundation and our partner network.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">What we accept</h2>
      <ul className="list-disc pl-6 space-y-1 text-slate-700">
        <li>Manual and powered wheelchairs (clean, working condition)</li>
        <li>Walkers, rollators, crutches, and canes</li>
        <li>Hospital beds and pressure-relief mattresses</li>
        <li>Prosthetics and orthotic braces</li>
        <li>Hearing aids and assistive listening devices</li>
        <li>Sealed, unopened consumables (catheters, dressings, gloves)</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">What we can't accept</h2>
      <ul className="list-disc pl-6 space-y-1 text-slate-700">
        <li>Expired medications or opened sterile supplies</li>
        <li>Equipment with broken frames or missing safety parts</li>
        <li>Items recalled by the manufacturer</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">How to donate</h2>
      <ol className="list-decimal pl-6 space-y-2 text-slate-700">
        <li>
          <strong>Email us a list and photos</strong> at{" "}
          <a className="text-blue-700 underline" href={`mailto:${FOUNDATION_INFO.email}`}>
            {FOUNDATION_INFO.email}
          </a>{" "}
          so we can confirm fit and condition.
        </li>
        <li>
          <strong>We'll coordinate pickup or a drop-off point</strong> with the nearest partner
          clinic or volunteer.
        </li>
        <li>
          <strong>Receive a donation acknowledgement</strong> for your records once items are
          inspected and accepted.
        </li>
      </ol>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">Donating near you</h2>
      <p className="text-slate-700">
        If you're outside our direct service area, we can refer you to vetted partners that
        refurbish and redistribute mobility equipment to people with disabilities in low-resource
        settings. Reach out — we'll help you find the closest option.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">Prefer to give financially?</h2>
      <p className="text-slate-700">
        A monetary donation lets us source custom-fit wheelchairs and rehabilitation services where
        they're needed most.{" "}
        <Link to="/donate" className="text-blue-700 underline">
          Donate online here
        </Link>
        .
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">Related resources</h2>
      <ul className="list-disc pl-6 space-y-1 text-slate-700">
        <li>
          <Link to="/guides/mobility-aid-grants" className="text-blue-700 underline">
            Mobility aid grants — eligibility & how to apply
          </Link>
        </li>
        <li>
          <Link to="/guides/free-medical-equipment" className="text-blue-700 underline">
            How to access free mobility aids & medical equipment
          </Link>
        </li>
        <li>
          <Link to="/faq/donations" className="text-blue-700 underline">
            Donation FAQ
          </Link>
        </li>
      </ul>

      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-slate-800 font-semibold mb-2">Contact our supplies team</p>
        <p className="text-slate-700 text-sm">
          Email:{" "}
          <a className="text-blue-700 underline" href={`mailto:${FOUNDATION_INFO.email}`}>
            {FOUNDATION_INFO.email}
          </a>
        </p>
        <p className="text-slate-700 text-sm">Phone: {FOUNDATION_INFO.phone}</p>
      </div>
    </article>
  );
}
