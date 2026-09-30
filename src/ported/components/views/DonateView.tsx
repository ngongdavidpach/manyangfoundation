import React, { useState } from "react";
import {
  Check,
  Copy,
  Heart,
  Info,
  Landmark,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { useFoundationInfo } from "../../hooks/useFoundationInfo";
import { submitDonationIntent } from "@/lib/intake.functions";
import { usePageSettings } from "../../hooks/usePageSettings";

type Channel = "bank" | "payid" | "momo" | "paypal";

interface DonationTier {
  amount: number;
  label: string;
  desc: string;
}

interface DonateContent {
  donationTiers?: DonationTier[];
  channels?: Array<{ id: Channel; label: string }>;
  paymentDetails?: {
    bankName?: string;
    accountName?: string;
    bsb?: string;
    accountNumber?: string;
    payId?: string;
  };
}

const DEFAULT_DONATE_CONTENT: DonateContent = {
  channels: [
    { id: "bank", label: "Bank transfer" },
    { id: "payid", label: "PayID" },
  ],
  paymentDetails: {
    bankName: "Commonwealth Bank",
    accountName: "Manyang M Manyang",
    bsb: "063132",
    accountNumber: "11477543",
    payId: "0434133392",
  },
};

interface PaymentDetailsProps {
  details: NonNullable<DonateContent["paymentDetails"]>;
  compact?: boolean;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ details, compact = false }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyValue = async (label: string, value: string) => {
    setCopied(label);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const field = document.createElement("textarea");
      field.value = value;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    window.setTimeout(() => setCopied(null), 1800);
  };

  const copyButton = (label: string, value?: string) =>
    value ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-blue-700"
        onClick={() => copyValue(label, value)}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
      >
        {copied === label ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </Button>
    ) : null;

  return (
    <div className={`grid grid-cols-1 ${compact ? "gap-3" : "md:grid-cols-2 gap-4"}`}>
      <section className="border border-slate-200 bg-white rounded-lg p-4" aria-labelledby={compact ? undefined : "bank-transfer-heading"}>
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="w-5 h-5 text-blue-700" aria-hidden="true" />
          <h3 id={compact ? undefined : "bank-transfer-heading"} className="font-bold text-slate-900">Bank transfer</h3>
        </div>
        <dl className="space-y-2 text-sm">
          <div><dt className="text-xs text-slate-500">Bank</dt><dd className="font-semibold text-slate-900">{details.bankName}</dd></div>
          <div className="flex items-center justify-between gap-3">
            <div><dt className="text-xs text-slate-500">Account name</dt><dd className="font-semibold text-slate-900">{details.accountName}</dd></div>
            {copyButton("account name", details.accountName)}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div><dt className="text-xs text-slate-500">BSB</dt><dd className="font-mono font-bold text-slate-900">{details.bsb}</dd></div>
            {copyButton("BSB", details.bsb)}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div><dt className="text-xs text-slate-500">Account number</dt><dd className="font-mono font-bold text-slate-900">{details.accountNumber}</dd></div>
            {copyButton("account number", details.accountNumber)}
          </div>
        </dl>
      </section>

      <section className="border border-amber-200 bg-amber-50 rounded-lg p-4" aria-labelledby={compact ? undefined : "payid-heading"}>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-amber-700" aria-hidden="true" />
          <h3 id={compact ? undefined : "payid-heading"} className="font-bold text-slate-900">PayID</h3>
        </div>
        <p className="text-xs text-slate-600 mb-2">Use this mobile-number PayID in your banking app.</p>
        <div className="flex items-center justify-between gap-3 bg-white border border-amber-200 rounded-md px-3 py-2">
          <span className="font-mono font-bold text-slate-900">{details.payId}</span>
          {copyButton("PayID", details.payId)}
        </div>
        <p aria-live="polite" className="mt-2 min-h-4 text-xs font-medium text-emerald-700">
          {copied === "PayID" ? "PayID copied" : ""}
        </p>
      </section>
    </div>
  );
};

export const DonateView: React.FC = () => {
  const { content: foundationInfo } = useFoundationInfo();
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [channel, setChannel] = useState<Channel>("bank");

  const [donor, setDonor] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    isAnonymous: false,
    message: "",
  });

  const [processing, setProcessing] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [pledge, setPledge] = useState<null | {
    reference: string;
    date: string;
    amount: number;
    name: string;
    email: string;
    channel: Channel;
  }>(null);
  const [serverError, setServerError] = useState<string>("");

  const submitIntent = useServerFn(submitDonationIntent);

  const { content: donateContent } = usePageSettings<DonateContent>(
    "donate",
    DEFAULT_DONATE_CONTENT,
  );

  const donationTiers = donateContent?.donationTiers || [];

  const channels = donateContent.channels?.length
    ? donateContent.channels
    : DEFAULT_DONATE_CONTENT.channels ?? [];
  const paymentDetails = {
    ...DEFAULT_DONATE_CONTENT.paymentDetails,
    ...donateContent.paymentDetails,
  };

  const handleAmountSelect = (tierAmount: number) => {
    setAmount(tierAmount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    setAmount(!isNaN(parsed) && parsed > 0 ? parsed : 0);
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 1) return;
    setServerError("");
    setProcessing(true);

    try {
      const result = await submitIntent({
        data: {
          donorName: donor.isAnonymous ? undefined : donor.fullName,
          donorEmail: donor.email || undefined,
          donorPhone: donor.phone || undefined,
          donorCountry: donor.country,
          isAnonymous: donor.isAnonymous,
          amount,
          currency: "USD",
          frequency: "one-time",
          channel,
          message: donor.message || undefined,
        },
      });
      setCompleted(true);
      setPledge({
        reference: result.reference,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        amount,
        name: donor.isAnonymous ? "Anonymous Donor" : donor.fullName || "Supporter",
        email: donor.email || "Not provided",
        channel,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Unable to record your pledge. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setCompleted(false);
    setPledge(null);
    setAmount(0);
    setCustomAmount("");
  };

  return (
    <div className="space-y-12 py-10 animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
          Pledge to Give
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Invest in Mobility and Dignity
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Donate directly by bank transfer or PayID. You can also record your gift below so we can
          match it and send your receipt once the funds arrive.
        </p>
      </div>

      {/* Transparency notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 max-w-3xl mx-auto">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>No card or banking login details are collected on this site.</strong> Complete
          your gift securely through your own banking app using the verified details below.
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Donation payment details</h2>
          <p className="text-sm text-slate-600 mt-1">Please include your name or pledge reference as the payment description.</p>
        </div>
        <PaymentDetails details={paymentDetails} />
      </div>

      {completed && pledge ? (
        /* Pledge Confirmation */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden max-w-2xl mx-auto animate-fade-in">
          <div className="bg-blue-900 text-white p-6 sm:p-8 text-center relative">
            <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              Pledge Recorded
            </div>

            <div className="w-12 h-12 rounded-full bg-white text-blue-900 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Heart className="w-6 h-6 fill-blue-900" />
            </div>

            <h2 className="text-2xl font-bold">Thank You for Your Pledge!</h2>
            <p className="text-blue-200 text-xs mt-1">{foundationInfo.name}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center pb-6 border-b border-slate-200">
              <span className="text-xs text-slate-500 uppercase tracking-widest block font-medium">
                Pledged Amount
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 block mt-1">
                ${pledge.amount}.00
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full mt-2">
                <Info className="w-3.5 h-3.5" /> Awaiting transfer — not yet received
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Pledge Reference:</span>
                <span className="font-mono font-bold text-slate-900">{pledge.reference}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-900">{pledge.date}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Donor:</span>
                <span className="font-medium text-slate-900">{pledge.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Preferred Channel:</span>
                <span className="font-bold text-blue-700 uppercase">{pledge.channel}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-1">Next Steps</p>
              Transfer your donation using the details below and enter <strong>{pledge.reference}</strong> as the payment description. {pledge.email !== "Not provided" && (<>A confirmation has been emailed to <strong>{pledge.email}</strong>.</>)}
            </div>

            <PaymentDetails details={paymentDetails} compact />

            <div className="pt-2">
              <Button
                onClick={reset}
                className="w-full font-bold"
              >
                Make Another Pledge
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Pledge Form */
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Tiers */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Your Impact Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {donationTiers.map((tier) => {
                  const isSelected = amount === tier.amount && !customAmount;
                  return (
                    <button
                      type="button"
                      key={tier.amount}
                      onClick={() => handleAmountSelect(tier.amount)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`text-xl font-extrabold ${isSelected ? "text-blue-700" : "text-slate-900"}`}
                          >
                            ${tier.amount}
                          </span>
                          {isSelected && (
                            <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              Selected
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800 block mb-1">
                          {tier.label}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{tier.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom amount */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Or Enter Custom Amount ($ USD)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-500">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="Other Amount"
                  min="1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-7 pr-3 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Channel */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Preferred Transfer Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {channels.map((c) => {
                  const Icon = c.id === "payid" ? Smartphone : Landmark;
                  const isActive = channel === c.id;
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      key={c.id}
                      onClick={() => setChannel(c.id)}
                      className={`h-auto p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? "border-amber-500 bg-amber-50/40 text-slate-950 font-bold ring-1 ring-amber-500"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-amber-600" : "text-slate-500"}`}
                      />
                      <span className="text-xs">{c.label}</span>
                    </Button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                Use the payment details shown above, then record your pledge so we can match your transfer.
              </p>
            </div>

            {/* Donor info */}
            <form
              onSubmit={handlePledgeSubmit}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Your Contact Details</h3>
                <p className="text-xs text-slate-500">
                  So we can match your transfer and send your receipt once funds are received.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donor-full-name" className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    id="donor-full-name"
                    type="text"
                    required={!donor.isAnonymous}
                    disabled={donor.isAnonymous}
                    value={donor.fullName}
                    onChange={(e) => setDonor({ ...donor, fullName: e.target.value })}
                    placeholder={donor.isAnonymous ? "Anonymous Donor" : "Your legal name"}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="donor-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    id="donor-email"
                    type="email"
                    value={donor.email}
                    onChange={(e) => setDonor({ ...donor, email: e.target.value })}
                    placeholder="To receive a confirmation email"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donor-phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    id="donor-phone"
                    type="tel"
                    value={donor.phone}
                    onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="donor-country" className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    id="donor-country"
                    type="text"
                    value={donor.country}
                    onChange={(e) => setDonor({ ...donor, country: e.target.value })}
                    placeholder="Enter your country"
                    maxLength={80}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Message
                </label>
                <input
                  type="text"
                  value={donor.message}
                  onChange={(e) => setDonor({ ...donor, message: e.target.value })}
                  placeholder="e.g. In honor of..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donor.isAnonymous}
                    onChange={(e) => setDonor({ ...donor, isAnonymous: e.target.checked })}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>Keep my pledge anonymous on public impact rosters.</span>
                </label>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">
                  {serverError}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processing || amount < 1}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Recording your pledge…
                    </span>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-slate-950 text-slate-950" />
                       <span>Pledge ${amount}.00</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> No card data collected
                </span>
                <span>•</span>
                <span>Pledges are non-binding</span>
              </div>
            </form>
        </div>
      )}
    </div>
  );
};
