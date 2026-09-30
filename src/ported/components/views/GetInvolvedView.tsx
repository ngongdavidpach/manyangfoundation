import React, { useState } from "react";
import {
  HeartHandshake,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Wrench,
  HeartPulse,
  GraduationCap,
  Globe,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useFoundationInfo } from "../../hooks/useFoundationInfo";
import { submitVolunteerApplication, submitPartnerInquiry } from "@/lib/intake.functions";
import { CountrySelect } from "../ui/CountrySelect";
import { usePageSettings } from "../../hooks/usePageSettings";

interface GetInvolvedContent {
  availableSkills?: Array<{ id: string; label: string; icon: any }>;
  volunteerOptions?: {
    availability?: Array<{ value: string; label: string }>;
  };
  partnerOptions?: {
    orgTypes?: Array<{ value: string; label: string }>;
    partnershipTypes?: Array<{ value: string; label: string }>;
  };
}

export const GetInvolvedView: React.FC = () => {
  const { content: foundationInfo } = useFoundationInfo();
  const [activeTab, setActiveTab] = useState<"volunteer" | "partner">("volunteer");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");
  const submitVolunteerFn = useServerFn(submitVolunteerApplication);
  const submitPartnerFn = useServerFn(submitPartnerInquiry);

  const [vForm, setVForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    skills: [] as string[],
    availability: 'part-time',
    message: '',
  });
  const [pForm, setPForm] = useState({
    orgName: '',
    contactPerson: '',
    email: '',
    phone: '',
    orgType: 'corporate',
    partnershipType: 'raw-materials',
    message: '',
  });

  const { content: getInvolvedContent } = usePageSettings<GetInvolvedContent>('get-involved', {});
  
  const availableSkills = getInvolvedContent?.availableSkills || [
    { id: "repair", label: "Biomedical & Equipment Repair", icon: Wrench },
    { id: "medical", label: "Medical Care & Rehab Therapy", icon: HeartPulse },
    { id: "education", label: "Special Needs Inclusive Teaching", icon: GraduationCap },
    { id: "logistics", label: "Field Logistics & Distribution", icon: Users },
    { id: "digital", label: "Digital Awareness & Media", icon: Globe },
    { id: "fundraising", label: "Grant Writing & Fundraising", icon: Sparkles },
  ];

  const availabilityOptions = getInvolvedContent?.volunteerOptions?.availability || [
    { value: "part-time", label: "A few hours per week" },
    { value: "events", label: "On-call for major distribution days" },
    { value: "remote", label: "Remote digital advising only" },
    { value: "full-time", label: "Full-time sabbatical / field mission" },
  ];

  const orgTypeOptions = getInvolvedContent?.partnerOptions?.orgTypes || [
    { value: "corporate", label: "Private Corporation / Enterprise" },
    { value: "hospital", label: "Hospital / Healthcare Provider" },
    { value: "university", label: "Academic Institution / University" },
    { value: "foundation", label: "Philanthropic Foundation" },
    { value: "ngo", label: "International Non-Governmental Organization" },
  ];

  const partnershipTypeOptions = getInvolvedContent?.partnerOptions?.partnershipTypes || [
    { value: "raw-materials", label: "Donation of Raw Materials & Wheelchair Parts" },
    { value: "funding", label: "Direct Programmatic Capacity Funding" },
    { value: "medical-staff", label: "Deployment of Specialized Medical Personnel" },
    { value: "advocacy-media", label: "Media Awareness & Co-Branded Advocacy" },
  ];

  const handleVSkillToggle = (skillId: string) => {
    setVForm((prev) => {
      const exists = prev.skills.includes(skillId);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skillId) : [...prev.skills, skillId],
      };
    });
  };

  const handleVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vForm.fullName || !vForm.email) return;
    setServerError("");
    setSubmitting(true);
    try {
      await submitVolunteerFn({
        data: {
          fullName: vForm.fullName,
          email: vForm.email,
          phone: vForm.phone,
          country: vForm.country,
          city: vForm.city,
          skills: vForm.skills,
          availability: vForm.availability,
          message: vForm.message,
        },
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pForm.orgName || !pForm.email || !pForm.contactPerson) return;
    setServerError("");
    setSubmitting(true);
    try {
      await submitPartnerFn({
        data: {
          orgName: pForm.orgName,
          contactPerson: pForm.contactPerson,
          email: pForm.email,
          phone: pForm.phone,
          orgType: pForm.orgType,
          partnershipType: pForm.partnershipType,
          message: pForm.message,
        },
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForms = () => {
    setSubmitted(false);
    setVForm({
      fullName: "",
      email: "",
      phone: "",
      country: "Cameroon",
      city: "",
      skills: [],
      availability: "part-time",
      message: "",
    });
    setPForm({
      orgName: "",
      contactPerson: "",
      email: "",
      phone: "",
      orgType: "corporate",
      partnershipType: "raw-materials",
      message: "",
    });
  };

  return (
    <div className="space-y-12 py-10 animate-fade-in max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
          Global Solidarity Network
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Join the Foundation's Mission
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Whether you are an individual wanting to volunteer your expert craft or an institution
          seeking to build sustainable inclusion, we invite you to actively collaborate with us.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 sm:p-12 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Thank You for Your Generous Offer!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your submission has been received and is now in our intake queue. The MDF engagement
              team will review your details and follow up by email.
            </p>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Our volunteer network managers typically respond within 3-5 business days.
          </p>

          <div className="pt-4">
            <button
              onClick={resetForms}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tab switches */}
          <div className="grid grid-cols-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("volunteer")}
              className={`py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "volunteer"
                  ? "bg-blue-50/50 text-blue-700 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Individual Volunteer</span>
            </button>
            <button
              onClick={() => setActiveTab("partner")}
              className={`py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "partner"
                  ? "bg-blue-50/50 text-blue-700 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Corporate & NGO Partner</span>
            </button>
          </div>

          {/* Volunteer Form Content */}
          {activeTab === "volunteer" && (
            <form onSubmit={handleVSubmit} className="p-6 sm:p-10 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Volunteer Application</h2>
                <p className="text-xs text-slate-500">
                  Provide your contact info and select the areas where your expertise can assist.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={vForm.fullName}
                    onChange={(e) => setVForm({ ...vForm, fullName: e.target.value })}
                    placeholder="Enter your full legal name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={vForm.email}
                    onChange={(e) => setVForm({ ...vForm, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={vForm.phone}
                    onChange={(e) => setVForm({ ...vForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <CountrySelect
                    id="volunteer-country"
                    name="country"
                    value={vForm.country}
                    onChange={(value) => setVForm({ ...vForm, country: value })}
                    placeholder="Search or select a country..."
                    label="Country"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    value={vForm.city}
                    onChange={(e) => setVForm({ ...vForm, city: e.target.value })}
                    placeholder="Your primary city"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Your Skills & Contribution Areas (Multiple Choice)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableSkills.map((skill) => {
                    const Icon = typeof skill.icon === "function" ? skill.icon : Sparkles;
                    const isSelected = vForm.skills.includes(skill.id);
                    return (
                      <button
                        type="button"
                        key={skill.id}
                        onClick={() => handleVSkillToggle(skill.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs leading-tight">{skill.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="volunteer-availability"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Availability
                  </label>
                  <select
                    id="volunteer-availability"
                    aria-label="Availability"
                    value={vForm.availability}
                    onChange={(e) => setVForm({ ...vForm, availability: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {availabilityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Additional Information
                  </label>
                  <input
                    type="text"
                    value={vForm.message}
                    onChange={(e) => setVForm({ ...vForm, message: e.target.value })}
                    placeholder="Briefly mention relevant experience"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col items-end gap-2">
                {serverError && <p className="text-xs text-red-600 font-medium">{serverError}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{submitting ? "Submitting…" : "Submit Volunteer Offer"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Partner Form Content */}
          {activeTab === "partner" && (
            <form onSubmit={handlePSubmit} className="p-6 sm:p-10 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Institutional & Corporate Partnership
                </h2>
                <p className="text-xs text-slate-500">
                  Initiate a formal alliance to deliver mobility and healthcare resources at scale.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pForm.orgName}
                    onChange={(e) => setPForm({ ...pForm, orgName: e.target.value })}
                    placeholder="Legal name of entity"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={pForm.contactPerson}
                    onChange={(e) => setPForm({ ...pForm, contactPerson: e.target.value })}
                    placeholder="Full name & title"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={pForm.email}
                    onChange={(e) => setPForm({ ...pForm, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={pForm.phone}
                    onChange={(e) => setPForm({ ...pForm, phone: e.target.value })}
                    placeholder="Direct office line"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="partner-org-type"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Entity Type
                  </label>
                  <select
                    id="partner-org-type"
                    aria-label="Entity Type"
                    value={pForm.orgType}
                    onChange={(e) => setPForm({ ...pForm, orgType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {orgTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="partner-partnership-type"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Proposed Partnership Scope
                  </label>
                  <select
                    id="partner-partnership-type"
                    aria-label="Proposed Partnership Scope"
                    value={pForm.partnershipType}
                    onChange={(e) => setPForm({ ...pForm, partnershipType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {partnershipTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Partnership Message / Proposal Summary
                </label>
                <textarea
                  rows={3}
                  value={pForm.message}
                  onChange={(e) => setPForm({ ...pForm, message: e.target.value })}
                  placeholder="Outline the core goals of our collaboration..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col items-end gap-2">
                {serverError && <p className="text-xs text-red-600 font-medium">{serverError}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{submitting ? "Submitting…" : "Submit Partnership Proposal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Auxiliary Contact */}
      <div className="text-center bg-slate-100 p-6 rounded-xl border border-slate-200 space-y-1">
        <p className="text-xs font-bold text-slate-900">Direct Institutional Relations</p>
        <p className="text-xs text-slate-600">
          For bilateral funding frameworks or urgent corporate giving, directly reach our Board
          Chair at <strong className="text-blue-600">{foundationInfo.email}</strong>
        </p>
      </div>
    </div>
  );
};
