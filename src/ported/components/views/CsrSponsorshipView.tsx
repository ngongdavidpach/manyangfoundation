import React from "react";
import { Link } from "@tanstack/react-router";
import { Download, Building2, HeartHandshake, FileText, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "Bronze",
    range: "$5,000 – $14,999",
    impact: "5–10 mobility aids shipped",
    benefits: [
      "Logo on supporters page",
      "Quarterly impact report",
      "CSR receipt with ABN",
    ],
  },
  {
    name: "Silver",
    range: "$15,000 – $49,999",
    impact: "1 container of refurbished wheelchairs",
    benefits: [
      "All Bronze benefits",
      "Co-branded field photos",
      "Staff volunteering day",
      "Named beneficiary stories",
    ],
  },
  {
    name: "Gold",
    range: "$50,000 – $149,999",
    impact: "Full equipment shipment + rehab supplies",
    benefits: [
      "All Silver benefits",
      "Invitation to annual gala",
      "Documentary footage",
      "Joint press release",
    ],
  },
  {
    name: "Platinum",
    range: "$150,000+",
    impact: "Multi-shipment programme + clinic kits",
    benefits: [
      "All Gold benefits",
      "Named programme",
      "Board briefing",
      "Hosted site visit in East Africa",
    ],
  },
];

export const CsrSponsorshipView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-3">
            Corporate Social Responsibility
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-3xl">
            Sponsor equipment shipments that restore mobility across East Africa.
          </h1>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-8 items-start">
          <p className="text-slate-600 text-base md:text-lg">
            Partner with the Manyang Disability Foundation to fund custom wheelchairs,
            prosthetics and rehabilitation supplies — with measurable, documented impact
            and an Australian tax receipt issued against our ABN.
          </p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a
              href="/downloads/mdf-csr-prospectus.pdf"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-lg text-sm"
            >
              <Download className="w-4 h-4" /> Download Prospectus (PDF)
            </a>
            <a
              href="/downloads/mdf-sponsorship-tiers.pdf"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-5 py-3 rounded-lg text-sm border border-slate-300"
            >
              <FileText className="w-4 h-4" /> Tier List (PDF)
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Sponsorship tiers</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Every tier includes quarterly reporting on equipment shipped and beneficiaries
          served, plus a tax receipt against ABN 75 986 228 179.
        </p>


        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm"
            >
              <div className="flex items-center gap-2 text-blue-700">
                <HeartHandshake className="w-5 h-5" />
                <span className="font-bold">{t.name}</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{t.range}</div>
              <div className="mt-1 text-sm text-slate-600">{t.impact}</div>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700 flex-1">
                {t.benefits.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-blue-600">›</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-700" /> Talk to our partnerships team
            </h2>
            <p className="mt-3 text-slate-600">
              Tell us about your CSR goals and we will respond within five business days
              with a tailored proposal and shipment timeline.
            </p>
            <ul className="mt-5 text-sm text-slate-700 space-y-1">
              <li>
                Email:{" "}
                <a
                  className="text-blue-700 underline"
                  href="mailto:partnerships@manyangdisabilityfoundation.org"
                >
                  partnerships@manyangdisabilityfoundation.org
                </a>
              </li>
              <li>ABN: 75 986 228 179 (Australia)</li>
            </ul>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
            <h3 className="font-bold text-slate-900">Submit a partnership enquiry</h3>
            <p className="text-sm text-slate-600">
              Use the standard partnership enquiry form on the Get Involved page — your
              message routes to the same team.
            </p>
            <Link
              to="/get-involved"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm"
            >
              Open enquiry form <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CsrSponsorshipView;
