import React, { useState } from "react";
import {
  HeartHandshake,
  Target,
  Eye,
  ShieldCheck,
  Award,
  Globe,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { type FAQItem } from "../../data/foundationData";
import { usePageSettings } from "../../hooks/usePageSettings";
import { useFoundationInfo } from "../../hooks/useFoundationInfo";

interface AboutContent {
  faqs?: FAQItem[];
  aboutContent?: {
    origin: string;
    philosophy: string;
    partnership: string;
    stats: Array<{ label: string; value: string }>;
  };
  team?: Array<{ name: string; role: string; bio: string; image: string }>;
  financialAllocation?: Array<{ category: string; percentage: string; desc: string }>;
}

export const AboutView: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<string>("all");
  const { content: foundationInfo } = useFoundationInfo();


  const { content: aboutContent } = usePageSettings<AboutContent>("about", {});
  const faqs = aboutContent?.faqs || [];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const filteredFaqs =
    faqCategory === "all" ? faqs : faqs.filter((f) => f.category === faqCategory);

  const originText = aboutContent?.aboutContent?.origin || "";
  const philosophyText = aboutContent?.aboutContent?.philosophy || "";
  const partnershipText = aboutContent?.aboutContent?.partnership || "";
  const stats = aboutContent?.aboutContent?.stats || [];
  const team = aboutContent?.team || [];
  const financialAllocation = aboutContent?.financialAllocation || [];

  return (
    <div className="space-y-16 lg:space-y-24 py-10 animate-fade-in">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
            Organizational Identity
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            About the Manyang Disability Foundation
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Founded on the unshakeable belief that every person deserves to live with dignity and
            independence, our foundation operates at the crucial intersection of humanitarian care,
            practical mobility, and legal advocacy.
          </p>
        </div>
      </section>

      {/* Our Origin & Core Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Our Journey & Roots
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              From Local Empathy to Global Action
            </h3>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>{originText}</p>
              <p>{philosophyText}</p>
              <p className="font-medium text-slate-900">{partnershipText}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="block text-2xl font-extrabold text-blue-700">{stat.value}</span>
                  <span className="block text-xs font-medium text-slate-600 mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image & Vision side */}
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-md relative h-80">
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80"
                alt="Community care and assistance"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Our Motivation
                </span>
                <p className="text-sm font-medium mt-0.5">
                  Building stronger, deeply interconnected communities where ability is defined by
                  opportunity.
                </p>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-blue-700">
                  <Target className="w-5 h-5" />
                  <h4 className="font-bold text-sm">Our Mission</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{foundationInfo.mission}</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-blue-700">
                  <Eye className="w-5 h-5" />
                  <h4 className="font-bold text-sm">Our Vision</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{foundationInfo.vision}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Guiding Principles
            </h2>
            <p className="text-3xl font-bold tracking-tight mt-1">
              The Four Pillars of Our Integrity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Uncompromising Dignity",
                desc: "We completely reject patronizing narratives. Our assistance is delivered with mutual respect, honoring the absolute agency of each individual.",
              },
              {
                icon: HeartHandshake,
                title: "Radical Inclusion",
                desc: "We ensure our decision-making bodies and field implementation teams include individuals with lived experiences of disability.",
              },
              {
                icon: Award,
                title: "Absolute Transparency",
                desc: "Every single grant, equipment procurement, and administrative overhead is meticulously logged and independently audited for maximum donor trust.",
              },
              {
                icon: Globe,
                title: "Sustainable Independence",
                desc: "We don't just provide emergency hand-outs; we build resilient pathways through skills training, custom adaptations, and systemic local advocacy.",
              },
            ].map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/60 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/30">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base text-white mb-2">{val.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{val.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/40 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Pillar {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership & Governance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Accountability & Leadership
          </h2>
          <p className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Governed by Experience and Compassion
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Our governing board brings together seasoned academics, certified medical practitioners,
            financial auditors, and active community leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="h-64 w-full bg-slate-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-base text-slate-900">{member.name}</h4>
                  <span className="text-xs font-semibold text-blue-600 block mt-0.5">
                    {member.role}
                  </span>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{member.bio}</p>
                </div>
              </div>
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                MDF Executive Board
              </div>
            </div>
          ))}
        </div>

        {/* Financial Transparency Section */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
                Financial Stewardship
              </span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Where Your Donations Go
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We believe in maximizing direct programmatic impact. By leveraging volunteer expert
                networks and efficient local supply chains, we maintain remarkably low
                administrative costs.
              </p>
              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Audited by independent CPAs</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Full disclosure on annual returns</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {financialAllocation.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.category}
                      </span>
                      <span className="text-sm font-extrabold text-blue-600">
                        {item.percentage}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full my-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: item.percentage }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Structured FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Got Questions?
          </h2>
          <p className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: "all", label: "All Questions" },
            { id: "assistance", label: "Receiving Assistance" },
            { id: "donations", label: "Donations & Tax" },
            { id: "volunteering", label: "Volunteering" },
            { id: "general", label: "General Info" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFaqCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                faqCategory === cat.id
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 focus:outline-hidden"
                >
                  <span className="font-bold text-sm text-slate-900">{faq.question}</span>
                  <div
                    className={`w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0 transition-transform ${isOpen ? "rotate-180 bg-blue-50 text-blue-600" : "text-slate-400"}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
