import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Heart, ArrowRight, Download, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toEmbedUrl } from "../../lib/videoEmbed";
import { focusAreaIcon, normalizeFocusAreas, type FocusArea } from "../../lib/focusAreas";

interface InsightContent {
  title?: string;
  body?: string;
  cover?: string;
  brochureUrl?: string;
  brochureName?: string;
  videoUrl?: string;
}

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
}

export const HomeView = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<InsightContent | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [showDonateButton, setShowDonateButton] = useState(true);

  useEffect(() => {
    supabase
      .from("news_articles")
      .select("id, slug, title, excerpt, cover_image, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setArticles((data as NewsRow[]) || []);
        setLoading(false);
      });
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "home")
      .maybeSingle()
      .then(({ data }) => {
        const c = (data?.content as any) || {};
        setInsight((c.insight as InsightContent) || null);
        setShowInsight(!!c.showInsight);
      });
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "programs")
      .maybeSingle()
      .then(({ data }) => {
        const c = (data?.content as any) || {};
        setFocusAreas(c.showFocusAreasOnHome === false ? [] : normalizeFocusAreas(c.focusAreas));
      });
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "donate")
      .maybeSingle()
      .then(({ data }) => {
        const c = data?.content as any;
        if (c && c.showDonateButton === false) setShowDonateButton(false);
      });
  }, []);

  const insightEmbed = insight?.videoUrl ? toEmbedUrl(insight.videoUrl) : null;
  const hasInsight =
    showInsight &&
    !!insight &&
    !!(insight.title || insight.body || insight.brochureUrl || insight.videoUrl || insight.cover);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 via-white to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider inline-block mb-4">
            Manyang Disability Foundation
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Empowering Lives through Mobility, Care, and Community
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-5 max-w-2xl mx-auto leading-relaxed">
            We provide mobility aids, medical equipment, and direct support to
            people living with disabilities across South Sudan.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-6">
            {showDonateButton && (
              <button
                onClick={() => navigate({ to: "/donate" })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Donate Now
              </button>
            )}
            <button
              onClick={() => navigate({ to: "/get-involved" })}
              className="bg-white hover:bg-slate-50 text-slate-900 font-semibold px-6 py-3 rounded-lg border border-slate-300 text-sm transition-colors"
            >
              Get Involved
            </button>
          </div>
        </div>
      </section>

      {/* Foundation Insight */}

      {hasInsight && (
        <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                  Foundation Insight
                </span>
                {insight?.title && (
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {insight.title}
                  </h2>
                )}
                {insight?.body && (
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                    {insight.body}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  {insight?.brochureUrl && (
                    <a
                      href={insight.brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs inline-flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>{insight.brochureName || "Download brochure"}</span>
                    </a>
                  )}
                  {insight?.videoUrl && !insightEmbed && (
                    <a
                      href={insight.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs inline-flex items-center gap-2 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Watch video</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden bg-slate-100 shadow-sm aspect-video">
                {insightEmbed ? (
                  <iframe
                    src={insightEmbed}
                    title={insight?.title || "Foundation Insight"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : insight?.cover ? (
                  <img
                    src={insight.cover}
                    alt={insight.title || "Foundation Insight"}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Programs */}
      {focusAreas.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-wrap justify-between items-baseline gap-3 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
                  What We Do
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                  Our Programs
                </h2>
              </div>
              <button
                onClick={() => navigate({ to: "/programs" })}
                className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 group"
              >
                <span>See all programs</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {focusAreas.map((area, i) => {
                const Icon = focusAreaIcon(area.icon);
                return (
                  <Link
                    key={i}
                    to="/programs/$slug"
                    params={{ slug: area.slug || "" }}
                    className="group bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {area.title}
                      </p>
                      {area.description && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {area.description}
                        </p>
                      )}
                      <span className="text-[11px] font-bold text-blue-600 inline-flex items-center gap-1">
                        Learn more
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}




      {/* Latest News & Updates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
              Foundation Dispatches
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Recent News & Field Reports
            </h2>

          </div>
          <button
            onClick={() => navigate({ to: "/news" })}
            className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 group"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading latest news…</p>
        ) : articles.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-600">No news articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate({ to: "/news/$slug", params: { slug: article.slug } })}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  {article.cover_image && (
                    <div className="h-40 w-full overflow-hidden relative">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString()
                        : ""}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end text-[11px]">
                  <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    Read ›
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Final Call to Action */}
      <section className="bg-blue-600 text-white text-center py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Heart className="w-12 h-12 mx-auto text-amber-300 fill-amber-300 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Join Hands With Us Today
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
            Whether through a direct monthly donation, corporate partnership, or
            volunteering your local professional skills, you hold the power to
            completely transform the life of a person with a disability.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            {showDonateButton && (
              <button
                onClick={() => navigate({ to: "/donate" })}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm"
              >
                Donate Now
              </button>
            )}
            <button
              onClick={() => navigate({ to: "/get-involved" })}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3.5 rounded-xl border border-blue-500 transition-all text-sm"
            >
              Become a Volunteer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
