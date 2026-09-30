import { createFileRoute, Link } from "@tanstack/react-router";
import { useFoundationInfo } from "../ported/hooks/useFoundationInfo";

export const Route = createFileRoute("/guides/free-medical-equipment")({
  head: () => ({
    meta: [
      { title: "Free Mobility Aids & Medical Equipment Guide — MDF" },
      {
        name: "description",
        content:
          "A practical guide to finding free wheelchairs, walkers, crutches, prosthetics, and other mobility aids — including how to request support from MDF and partner charities.",
      },
      { property: "og:title", content: "How to Access Free Mobility Aids & Medical Equipment" },
      {
        property: "og:description",
        content:
          "Step-by-step guide to free wheelchairs, walkers, crutches, and assistive devices for people with disabilities.",
      },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: "https://manyangdisabilityfoundation.org/guides/free-medical-equipment",
      },
      { property: "og:image", content: "https://manyangdisabilityfoundation.org/images/logo.png" },
      { property: "og:site_name", content: "Manyang Disability Foundation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "How to Access Free Mobility Aids & Medical Equipment" },
      {
        name: "twitter:description",
        content:
          "Step-by-step guide to free wheelchairs, walkers, crutches, and assistive devices for people with disabilities.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://manyangdisabilityfoundation.org/guides/free-medical-equipment",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to Access Free Mobility Aids & Medical Equipment",
          description:
            "A practical guide to finding free wheelchairs, walkers, crutches, prosthetics, and other mobility aids — including how to request support from MDF and partner charities.",
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
          mainEntityOfPage: "https://manyangdisabilityfoundation.org/guides/free-medical-equipment",
        }),
      },
    ],
  }),
  component: FreeEquipmentGuide,
});

function FreeEquipmentGuide() {
  const { content: FOUNDATION_INFO } = useFoundationInfo();
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-slate">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
        How to Access Free Mobility Aids & Medical Equipment
      </h1>
      <p className="text-slate-600 text-lg mb-8">
        A wheelchair, walker, or pair of crutches can change a life — but new equipment is
        expensive. This guide explains how to request free or low-cost mobility aids from the
        Manyang Disability Foundation (MDF) and from other trusted charitable programs.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">
        Who qualifies for free equipment
      </h2>
      <p className="text-slate-700">Most assistance programs prioritize people who:</p>
      <ul className="list-disc pl-6 space-y-1 text-slate-700">
        <li>Live with a long-term mobility, vision, or hearing impairment</li>
        <li>Cannot afford to purchase the equipment privately</li>
        <li>Have a referral, clinical assessment, or prescription from a health worker</li>
        <li>Live in a community served by the program (local, national, or international)</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">
        Step 1 — Get a clinical assessment
      </h2>
      <p className="text-slate-700">
        Most reputable programs require a basic assessment so the device fits your body and
        condition. Ask a physiotherapist, rehabilitation officer, or community health worker to
        document your needs (height, weight, type of impairment, intended use). A simple letter or
        filled form is usually enough.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">
        Step 2 — Request support from MDF
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-slate-700">
        <li>
          <strong>Open our request form</strong> at{" "}
          <Link to="/request" className="text-blue-700 underline">
            /request
          </Link>{" "}
          and complete it in your own words.
        </li>
        <li>
          <strong>Attach the clinical note</strong> from Step 1 (a phone photo is fine) and a recent
          photo of yourself.
        </li>
        <li>
          <strong>We assess and respond</strong> within 7–14 days. If we can fit you with a custom
          wheelchair, crutches, or rehab support, we'll schedule a fitting at the nearest partner
          clinic.
        </li>
      </ol>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">
        Step 3 — Explore other charitable resources
      </h2>
      <p className="text-slate-700">
        If you are outside MDF's service area, or while you wait, these are well-known programs that
        distribute free or refurbished equipment:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-slate-700">
        <li>
          <strong>Free Wheelchair Mission</strong> — partners with local NGOs to distribute durable
          wheelchairs in low-income regions.
        </li>
        <li>
          <strong>Wheels for the World (Joni and Friends)</strong> — refurbishes donated wheelchairs
          and ships them to people in need worldwide.
        </li>
        <li>
          <strong>Walkin' & Rollin' Costumes / Latter-day Saint Charities</strong> — provide custom
          and pediatric mobility equipment in select countries.
        </li>
        <li>
          <strong>Local Red Cross / Red Crescent</strong> — often loans out crutches, walkers, and
          hospital beds short-term.
        </li>
        <li>
          <strong>Government disability welfare offices</strong> — many countries run subsidized
          assistive-device programs through the ministry of health or social welfare.
        </li>
        <li>
          <strong>Faith-based hospitals and mission clinics</strong> — frequently keep refurbished
          wheelchairs and orthotics for community distribution.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">
        Step 4 — Look locally for donated equipment
      </h2>
      <p className="text-slate-700">
        Many families donate equipment when a loved one no longer needs it. Try:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-slate-700">
        <li>Hospital social-work departments and discharge planners</li>
        <li>Community noticeboards and "buy-nothing" groups</li>
        <li>Disability self-help groups and parent associations</li>
        <li>Funeral homes and hospice services (with permission)</li>
      </ul>
      <p className="text-slate-700">
        Always have donated equipment inspected before use — frames crack, brakes wear out, and an
        ill-fitting device can cause pressure sores.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">
        Warning signs of unsafe equipment
      </h2>
      <ul className="list-disc pl-6 space-y-1 text-slate-700">
        <li>Bent frame, loose welds, or cracked plastic</li>
        <li>Worn-through tires or missing footrests</li>
        <li>Brakes that do not lock the wheels</li>
        <li>
          Hospital chairs (heavy, no cushion) used as full-time wheelchairs — these cause pressure
          injuries
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">Avoid scams</h2>
      <p className="text-slate-700">
        Legitimate charities never charge an "unlock" or "shipping" fee to release free equipment.
        If someone asks you to pay upfront to claim a free wheelchair, walk away and report it to
        your local consumer protection office.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-3">Other ways MDF can help</h2>
      <ul className="list-disc pl-6 space-y-1 text-slate-700">
        <li>
          <Link to="/programs" className="text-blue-700 underline">
            Mobility & rehabilitation programs
          </Link>{" "}
          — wheelchairs, crutches, repairs.
        </li>
        <li>
          <Link to="/guides/donate-supplies" className="text-blue-700 underline">
            Donate used medical supplies
          </Link>{" "}
          — to help us keep our equipment pool stocked.
        </li>
        <li>
          <Link to="/guides/mobility-aid-grants" className="text-blue-700 underline">
            Apply for a mobility aid grant
          </Link>{" "}
          — eligibility, documents, and process.
        </li>
        <li>
          <Link to="/faq/donations" className="text-blue-700 underline">
            Donation FAQ
          </Link>{" "}
          — for supporters who want to fund equipment.
        </li>
        <li>
          <Link to="/get-involved" className="text-blue-700 underline">
            Volunteer or partner
          </Link>{" "}
          — biomedical technicians and physiotherapists make this work possible.
        </li>
      </ul>

      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-slate-800 font-semibold mb-2">Need help right now?</p>
        <p className="text-slate-700 text-sm">
          Email:{" "}
          <a className="text-blue-700 underline" href={`mailto:${FOUNDATION_INFO.email}`}>
            {FOUNDATION_INFO.email}
          </a>
        </p>
        <p className="text-slate-700 text-sm">Phone: {FOUNDATION_INFO.phone}</p>
        <p className="text-slate-700 text-sm mt-3">
          Or submit a request directly:{" "}
          <Link to="/request" className="text-blue-700 underline">
            Request mobility support
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
