import { useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Accessibility,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { type Program, type SuccessStory } from "../../data/foundationData";
import { usePageSettings } from "../../hooks/usePageSettings";
import { focusAreaIcon, normalizeFocusAreas, type FocusArea } from "../../lib/focusAreas";

interface ProgramsContent {
  programs?: Program[];
  successStories?: SuccessStory[];
  focusAreas?: FocusArea[];
  crossCutting?: {
    title: string;
    subtitle: string;
    body: string;
    highlights: string[];
    ctaText: string;
    ctaLink: string;
  };
}

export const ProgramsView: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { content: programsContent } = usePageSettings<ProgramsContent>("programs", {});
  const programs = programsContent?.programs || [];
  const successStories = programsContent?.successStories || [];
  const focusAreas = normalizeFocusAreas(programsContent?.focusAreas);
  const crossCutting = programsContent?.crossCutting;

  const [selectedStory, setSelectedStory] = useState(successStories[0] || null);

  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case "Wheelchair":
        return <Accessibility className="w-6 h-6 text-blue-600" />;
      case "HeartPulse":
        return <HeartPulse className="w-6 h-6 text-blue-600" />;
      case "GraduationCap":
        return <GraduationCap className="w-6 h-6 text-blue-600" />;
      case "Briefcase":
        return <Briefcase className="w-6 h-6 text-blue-600" />;
      case "Scale":
        return <Scale className="w-6 h-6 text-blue-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  const filteredPrograms =
    activeCategory === "all" ? programs : programs.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-16 lg:space-y-24 py-10 animate-fade-in">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
            Humanitarian Interventions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Our Impact & Core Programs
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Explore how the Manyang Disability Foundation directly converts donor resources into
            durable mobility, inclusive classrooms, advanced healthcare, and sustainable
            self-reliance.
          </p>
        </div>
      </section>

      {/* Programs & Focus Areas */}
      {focusAreas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
              What We Do
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Programs &amp; Focus Areas
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {focusAreas.map((area, i) => {
              const Icon = focusAreaIcon(area.icon);
              return (
                <Link
                  key={i}
                  to="/programs/$slug"
                  params={{ slug: area.slug || "" }}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{area.title}</h3>
                  {area.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">{area.description}</p>
                  )}
                  <span className="mt-auto pt-2 text-xs font-bold text-blue-600 inline-flex items-center gap-1">
                    Learn more
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}



      {/* Program Categories Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 justify-center border-b border-slate-200 pb-6">
          {[
            { id: "all", label: "All Core Pillars" },
            { id: "mobility", label: "Mobility & Aids" },
            { id: "healthcare", label: "Healthcare & Rehab" },
            { id: "education", label: "Inclusive Education" },
            { id: "livelihood", label: "Livelihoods & Skills" },
            { id: "advocacy", label: "Rights & Advocacy" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-blue-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Detailed Program Grid */}
        <h2 className="sr-only">Core Programs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="h-56 w-full relative">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
                    {program.category}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs text-blue-900 text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                    {program.impactStats}
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      {getProgramIcon(program.iconName)}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {program.title}
                    </h3>
                  </div>

                  <p className="text-xs font-semibold text-blue-600">{program.shortDescription}</p>

                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    {program.fullDescription}
                  </p>
                </div>
              </div>

              {/* Action footing */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate({ to: "/request" })}
                  className="flex-1 bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <span>Request Support</span>
                </button>
                <button
                  onClick={() => navigate({ to: "/donate" })}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>Sponsor Pillar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Story Deep Spotlight */}
      {successStories.length > 0 && selectedStory && (
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
              Direct Beneficiary Spotlight
            </span>
            <h2 className="text-3xl font-bold tracking-tight mt-1">Real Stories of Dignity</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            {/* Selector list */}
            <div className="lg:col-span-1 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Select a Narrative:
              </span>
              {successStories.map((story) => {
                const isSelected = selectedStory.id === story.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-md"
                        : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
                    }`}
                  >
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <span className="block text-sm font-bold truncate">{story.name}</span>
                      <span className="block text-xs opacity-80 truncate">{story.aidType}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Display Box */}
            <div className="lg:col-span-2 bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-700 relative">
              <div className="absolute top-4 right-4 bg-amber-400/10 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                {selectedStory.date}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <img
                  src={selectedStory.image}
                  alt={selectedStory.name}
                  className="w-full sm:w-48 h-48 rounded-xl object-cover shrink-0 shadow-inner"
                />

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider block">
                      {selectedStory.location} • {selectedStory.aidType}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{selectedStory.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{selectedStory.story}</p>

                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs italic text-amber-300">"{selectedStory.quote}"</p>
                    <span className="block text-[11px] font-bold text-slate-400 mt-2">
                      – {selectedStory.name}, Beneficiary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}


      {/* Cross-cutting initiatives (admin-managed) */}
      {crossCutting && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-8 lg:p-12">
            <div className="max-w-3xl space-y-6">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                Emergency Mobility Response
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {crossCutting.title}
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed">{crossCutting.body}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {crossCutting.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate({ to: crossCutting.ctaLink })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg text-xs transition-colors inline-flex items-center gap-2"
                >
                  <span>{crossCutting.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
