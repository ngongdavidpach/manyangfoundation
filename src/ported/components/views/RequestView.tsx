import React, { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Layers,
  AlertCircle,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useFoundationInfo } from "../../hooks/useFoundationInfo";
import { submitAidRequest } from "@/lib/intake.functions";
import { CountrySelect } from "../ui/CountrySelect";


export const RequestView: React.FC = () => {
  const { content: foundationInfo } = useFoundationInfo();
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");
  const submitAidRequestFn = useServerFn(submitAidRequest);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Profile
    fullName: "",
    age: "",
    gender: "prefer-not-to-say",
    country: "",
    city: "",
    phone: "",
    email: "",
    isCaregiver: "self",
    caregiverName: "",

    // Step 2: Aid Request Details
    disabilityCategory: "physical-mobility",
    requestedAid: "wheelchair-custom",
    hasExistingDevice: "no",
    deviceCondition: "",

    // Step 3: Story & Context
    urgencyLevel: "medium",
    story: "",
    agreement: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.age || isNaN(Number(formData.age))) newErrors.age = "Valid age is required";
      if (!formData.city.trim()) newErrors.city = "City/District is required";
      if (!formData.phone.trim()) newErrors.phone = "Contact phone number is required";
      if (formData.isCaregiver === "caregiver" && !formData.caregiverName.trim()) {
        newErrors.caregiverName = "Caregiver full name is required";
      }
    } else if (currentStep === 2) {
      if (formData.hasExistingDevice === "yes" && !formData.deviceCondition.trim()) {
        newErrors.deviceCondition = "Please briefly describe the condition of the current device";
      }
    } else if (currentStep === 3) {
      if (!formData.story.trim() || formData.story.trim().length < 30) {
        newErrors.story = "Please provide a brief explanation (at least 30 characters)";
      }
      if (!formData.agreement) {
        newErrors.agreement = "You must accept the verification agreement";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setServerError("");
    setSubmitting(true);
    try {
      const result = await submitAidRequestFn({
        data: {
          fullName: formData.fullName,
          age: formData.age,
          gender: formData.gender,
          country: formData.country,
          city: formData.city,
          phone: formData.phone,
          email: formData.email || undefined,
          isCaregiver: formData.isCaregiver,
          caregiverName: formData.caregiverName,
          disabilityCategory: formData.disabilityCategory,
          requestedAid: formData.requestedAid,
          hasExistingDevice: formData.hasExistingDevice,
          deviceCondition: formData.deviceCondition,
          urgencyLevel: formData.urgencyLevel,
          story: formData.story,
        },
      });
      setTrackingCode(result.tracking_code);
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

  const resetForm = () => {
    setFormData({
      fullName: "",
      age: "",
      gender: "prefer-not-to-say",
      country: "",
      city: "",
      phone: "",
      email: "",
      isCaregiver: "self",
      caregiverName: "",
      disabilityCategory: "physical-mobility",
      requestedAid: "wheelchair-custom",
      hasExistingDevice: "no",
      deviceCondition: "",
      urgencyLevel: "medium",
      story: "",
      agreement: false,
    });
    setStep(1);
    setSubmitted(false);
    setTrackingCode("");
  };

  return (
    <div className="space-y-12 py-10 animate-fade-in max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
          Direct Access System
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Request Assistance or Mobility Aids
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Our intake process is entirely cost-free. Please fill out the parameters below to help our
          biomedical technicians and field liaisons assess your equipment configuration.
        </p>
      </div>

      {submitted ? (
        /* Success Screen */
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 sm:p-12 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Application Submitted Successfully!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your request has been securely dispatched to the Manyang Disability Foundation intake
              panel.
            </p>
          </div>

          {/* Reference tracking pill */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-md mx-auto space-y-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
              Your Tracking Reference ID:
            </span>
            <div className="text-lg sm:text-xl font-mono font-bold text-blue-700 bg-white py-2 px-4 rounded border border-slate-200 select-all">
              {trackingCode}
            </div>
            <p className="text-[11px] text-slate-500">
              Please save or write down this reference ID to track your application status.
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-2 max-w-lg mx-auto bg-blue-50/50 p-4 rounded-lg text-left">
            <p className="font-bold text-blue-900">What Happens Next?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Our local medical advisory panel will assess your file within 7-10 business days.
              </li>
              <li>
                A liaison officer will reach out via phone ({formData.phone}) to verify measurements
                or local physical delivery logistics.
              </li>
              <li>
                Once customized, your aid or direct grant will be scheduled for immediate provision.
              </li>
            </ol>
          </div>

          <div className="pt-4">
            <button
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      ) : (
        /* Form Application */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Step Progress Tracker */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[
                { num: 1, label: "Profile", icon: User },
                { num: 2, label: "Aid Details", icon: Layers },
                { num: 3, label: "Context", icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = step === item.num;
                const isCompleted = step > item.num;
                return (
                  <div key={item.num} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : item.num}
                    </div>
                    <span
                      className={`text-[11px] mt-1 font-medium inline-flex items-center gap-1 ${isCurrent ? "text-blue-600 font-bold" : "text-slate-500"}`}
                    >
                      <Icon className="w-3 h-3" />
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
            {/* STEP 1: Profile Information */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">
                    Step 1: Beneficiary Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide the primary details of the person needing assistance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Who is filling out this form? *
                    </label>
                    <select
                      name="isCaregiver"
                      value={formData.isCaregiver}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="self">I am requesting for myself</option>
                      <option value="caregiver">
                        I am a parent, caregiver, or community liaison
                      </option>
                    </select>
                  </div>

                  {formData.isCaregiver === "caregiver" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Caregiver / Liaison Full Name *
                      </label>
                      <input
                        type="text"
                        name="caregiverName"
                        value={formData.caregiverName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 ${errors.caregiverName ? "border-red-500" : "border-slate-300"}`}
                      />
                      {errors.caregiverName && (
                        <span className="text-red-500 text-[10px] mt-0.5 block">
                          {errors.caregiverName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Beneficiary Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter beneficiary's legal name"
                      className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 ${errors.fullName ? "border-red-500" : "border-slate-300"}`}
                    />
                    {errors.fullName && (
                      <span className="text-red-500 text-[10px] mt-0.5 block">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="e.g. 28"
                        min="1"
                        max="120"
                        className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 ${errors.age ? "border-red-500" : "border-slate-300"}`}
                      />
                      {errors.age && (
                        <span className="text-red-500 text-[10px] mt-0.5 block">{errors.age}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CountrySelect
                    id="request-country"
                    name="country"
                    label="Country of Residence"
                    required
                    value={formData.country}
                    onChange={(v) => setFormData((prev) => ({ ...prev, country: v }))}
                  />


                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / District / Village *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Bamenda, Ngong, Douala"
                      className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 ${errors.city ? "border-red-500" : "border-slate-300"}`}
                    />
                    {errors.city && (
                      <span className="text-red-500 text-[10px] mt-0.5 block">{errors.city}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Include country code e.g. +237..."
                      className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 ${errors.phone ? "border-red-500" : "border-slate-300"}`}
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-[10px] mt-0.5 block">{errors.phone}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="For tracking updates"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    ></input>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Aid Request Details */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">
                    Step 2: Assistance Scope & Parameters
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select the core intervention category required.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Primary Disability Category *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "physical-mobility",
                        label: "Physical / Mobility Impairment",
                        desc: "Spinal injury, amputation, polio, muscular conditions",
                      },
                      {
                        id: "sensory",
                        label: "Sensory Impairment",
                        desc: "Visual impairment, blindness, severe hearing loss",
                      },
                      {
                        id: "neurological",
                        label: "Neurological / Developmental",
                        desc: "Cerebral palsy, spina bifida, intellectual disability",
                      },
                      {
                        id: "multiple",
                        label: "Multiple / Chronic Conditions",
                        desc: "Requiring cross-cutting physical & health support",
                      },
                    ].map((cat) => (
                      <label
                        key={cat.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                          formData.disabilityCategory === cat.id
                            ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="disabilityCategory"
                            value={cat.id}
                            checked={formData.disabilityCategory === cat.id}
                            onChange={handleInputChange}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 pl-5 mt-1 block">
                          {cat.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Specific Assistive Aid or Program Requested *
                  </label>
                  <select
                    name="requestedAid"
                    value={formData.requestedAid}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <optgroup label="Mobility & Positioning">
                      <option value="wheelchair-custom">
                        Custom All-Terrain Manual Wheelchair
                      </option>
                      <option value="tricycle-hand">Hand-Crank Adaptive Tricycle</option>
                      <option value="repair-grant">
                        Wheelchair Hardware Repair / Re-welding Grant
                      </option>
                      <option value="crutches-orthotics">Custom Crutches / Orthotic Braces</option>
                      <option value="positioning-chair">
                        Specialized Pediatric Positioning Seat
                      </option>
                    </optgroup>
                    <optgroup label="Healthcare & Rehabilitation">
                      <option value="surgery-subsidy">Reconstructive Surgery Subsidy</option>
                      <option value="physical-therapy">
                        Continuous Physical Therapy Sponsorship
                      </option>
                    </optgroup>
                    <optgroup label="Education & Livelihoods">
                      <option value="education-grant">
                        Inclusive Education Tuition & Materials Grant
                      </option>
                      <option value="livelihood-kit">
                        Vocational Startup Tool Kit & Micro-grant
                      </option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Does the beneficiary currently have an assistive device? *
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-800">
                      <input
                        type="radio"
                        name="hasExistingDevice"
                        value="no"
                        checked={formData.hasExistingDevice === "no"}
                        onChange={handleInputChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>No, completely without assistance</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-800">
                      <input
                        type="radio"
                        name="hasExistingDevice"
                        value="yes"
                        checked={formData.hasExistingDevice === "yes"}
                        onChange={handleInputChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Yes, but it is damaged or outgrown</span>
                    </label>
                  </div>

                  {formData.hasExistingDevice === "yes" && (
                    <div className="pt-2 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Describe the condition of the current device *
                      </label>
                      <input
                        type="text"
                        name="deviceCondition"
                        value={formData.deviceCondition}
                        onChange={handleInputChange}
                        placeholder="e.g. Frame broken, tire missing, outgrown seat width"
                        className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 ${errors.deviceCondition ? "border-red-500" : "border-slate-300"}`}
                      />
                      {errors.deviceCondition && (
                        <span className="text-red-500 text-[10px] mt-0.5 block">
                          {errors.deviceCondition}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Context & Verification */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">
                    Step 3: Socio-Economic Context
                  </h2>
                  <p className="text-xs text-slate-500">
                    Help us understand how this device or grant will restore independence.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Urgency Assessment *
                  </label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="high">
                      Critical (Homebound, unable to attend school or work)
                    </option>
                    <option value="medium">
                      Moderate (Current device causes physical pain or severe strain)
                    </option>
                    <option value="preventative">Preventative / Upkeep Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Please provide a brief background narrative *
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">
                    Mention how the disability impacts daily life, and how this specific assistance
                    will build inclusion (e.g., returning to local school, starting a neighborhood
                    shop).
                  </p>
                  <textarea
                    name="story"
                    rows={4}
                    value={formData.story}
                    onChange={handleInputChange}
                    placeholder="Please explain the situation here (minimum 30 characters)..."
                    className={`w-full bg-slate-50 border rounded-lg p-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 ${errors.story ? "border-red-500" : "border-slate-300"}`}
                  />
                  {errors.story && (
                    <span className="text-red-500 text-[10px] mt-0.5 block">{errors.story}</span>
                  )}
                  <span className="text-[10px] text-slate-500 block text-right mt-1">
                    {formData.story.length} characters
                  </span>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <div className="flex gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs text-amber-900">
                      <p className="font-bold">Verification Notice</p>
                      <p>
                        To ensure total transparency and fairness, all applications are verified by
                        local community trustees. Filing a request confirms that the parameters
                        supplied are truthful to your best knowledge.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="inline-flex items-start gap-2 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreement"
                      checked={formData.agreement}
                      onChange={handleInputChange}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span>
                      I authorize the Manyang Disability Foundation to review this application and
                      contact the provided phone number for assessment. *
                    </span>
                  </label>
                  {errors.agreement && (
                    <span className="text-red-500 text-[10px] mt-1 block">{errors.agreement}</span>
                  )}
                </div>
              </div>
            )}

            {/* Form Footer Controls */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {serverError && <p className="text-xs text-red-600 font-medium">{serverError}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-8 py-2.5 rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? "Submitting…" : "Submit Official Application"}</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Auxiliary Help info */}
      <div className="text-center space-y-1">
        <p className="text-xs text-slate-500">Need direct help with your intake submission?</p>
        <p className="text-xs text-slate-600">
          Call our community officers at{" "}
          <strong className="text-blue-600">{foundationInfo.phone}</strong> or send an email to{" "}
          <strong className="text-blue-600">{foundationInfo.email}</strong>.
        </p>
      </div>
    </div>
  );
};
