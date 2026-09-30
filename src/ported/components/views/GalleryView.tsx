import { useNavigate, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Calendar, X, Heart, Maximize2 } from "lucide-react";
import { type GalleryImage } from "../../data/foundationData";
import { usePageSettings } from "../../hooks/usePageSettings";
import { supabase } from "@/integrations/supabase/client";

interface GalleryContent {
  images?: GalleryImage[];
}

const KNOWN_CATEGORIES: GalleryImage["category"][] = [
  "mobility",
  "medical",
  "education",
  "livelihood",
];

export const GalleryView: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const { content: galleryContent } = usePageSettings<GalleryContent>("gallery", {});
  const [dbImages, setDbImages] = useState<GalleryImage[] | null>(null);

  useEffect(() => {
    supabase
      .from("media_assets")
      .select("id, url, alt, tags, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = (data || []).map((m): GalleryImage => {
          const tags = (m.tags as string[]) || [];
          const cat =
            (KNOWN_CATEGORIES.find((c) => tags.includes(c)) as GalleryImage["category"]) ||
            "mobility";
          const dateStr = m.created_at
            ? new Date(m.created_at as string).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
              })
            : "";
          return {
            id: m.id as string,
            title: (m.alt as string) || "Field photo",
            location: "",
            category: cat,
            url: m.url as string,
            date: dateStr,
            description: (m.alt as string) || "",
          };
        });
        setDbImages(rows);
      });
  }, []);

  const images = useMemo(
    () => (dbImages && dbImages.length > 0 ? dbImages : galleryContent?.images || []),
    [dbImages, galleryContent],
  );

  const filteredImages =
    activeCategory === "all" ? images : images.filter((img) => img.category === activeCategory);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "mobility":
        return "Mobility & Wheelchairs";
      case "medical":
        return "Healthcare & Rehab";
      case "education":
        return "Inclusive Education";
      case "livelihood":
        return "Livelihoods & Skills";
      default:
        return "Foundation Action";
    }
  };

  return (
    <div className="space-y-12 py-10 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
          Visual Evidence
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Impact Gallery
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Take an authentic, direct look at our active field operations. From custom raw material
          assembly to smiling independent beneficiaries, every photograph captures true dignity in
          action.
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-slate-200 pb-6">
        {[
          { id: "all", label: "All Photos" },
          { id: "mobility", label: "Mobility & Repairs" },
          { id: "medical", label: "Healthcare Camps" },
          { id: "education", label: "Inclusive Classrooms" },
          { id: "livelihood", label: "Vocational Grants" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? "bg-blue-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      <section aria-labelledby="gallery-photos-heading">
        <h2 id="gallery-photos-heading" className="sr-only">
          Field Photos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs group flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <button
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Enlarge photo: ${img.title}`}
                  className="h-64 w-full relative overflow-hidden cursor-pointer bg-slate-100 block text-left"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Enlarge Photo</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {getCategoryLabel(img.category)}
                  </div>
                </button>

                {/* Text Info */}
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {img.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500" /> {img.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" /> {img.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 pt-1">{img.description}</p>
                </div>
              </div>

              {/* Micro action */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate({ to: "/donate" })}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Heart className="w-3 h-3 fill-amber-500" />
                  <span>Sponsor This Intervention</span>
                </button>

                <button
                  onClick={() => setSelectedImage(img)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox / Modal View */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Image section */}
            <div className="md:w-3/5 bg-slate-950 flex items-center justify-center relative min-h-[300px]">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                aria-label="Close image preview"
                className="absolute top-4 left-4 md:hidden bg-slate-900/80 text-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info panel */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                    {getCategoryLabel(selectedImage.category)}
                  </span>
                  <button
                    onClick={() => setSelectedImage(null)}
                    aria-label="Close image preview"
                    className="hidden md:block text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {selectedImage.title}
                </h2>

                <div className="space-y-1.5 text-xs text-slate-500 border-y border-slate-100 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-800">{selectedImage.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Captured in {selectedImage.date}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-1">
                    Context & Field Action
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedImage.description}
                  </p>
                </div>
              </div>

              {/* Sponsor action */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <p className="text-[11px] text-amber-900">
                    <strong>Inspired by this work?</strong> A direct contribution allows our
                    technical team to schedule continuous mobile distributions.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      navigate({ to: "/donate" });
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Heart className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                    <span>Sponsor Project</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      navigate({ to: "/programs" });
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-lg text-xs transition-colors"
                  >
                    View Core Pillar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auxiliary banner */}
      <div className="bg-blue-900 rounded-2xl text-white p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-lg">Have custom images or press videos to share?</h4>
          <p className="text-xs text-blue-200">
            If you are a certified local partner or media representative, submit your visual media
            directly to our team.
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/get-involved" })}
          className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-lg text-xs transition-colors hover:bg-blue-50 shrink-0"
        >
          Submit Media Files
        </button>
      </div>
    </div>
  );
};
