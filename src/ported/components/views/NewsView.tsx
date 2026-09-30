import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  ArrowRight,
  MapPin,
  Users,
  CheckCircle2,
  CalendarDays,
  FileText,
} from "lucide-react";
import { type NewsArticle, type FoundationEvent } from "../../data/foundationData";
import { submitEventRsvp } from "@/lib/intake.functions";
import { usePageSettings } from "../../hooks/usePageSettings";
import { supabase } from "@/integrations/supabase/client";

interface NewsContent {
  articles?: NewsArticle[];
  events?: FoundationEvent[];
}

interface NewsViewProps {
  articleId?: string;
  initialArticles?: NewsArticle[];
  initialEvents?: FoundationEvent[];
}

function estimateReadTime(text: string | null | undefined): string {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export const NewsView: React.FC<NewsViewProps> = ({ articleId, initialArticles, initialEvents }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"news" | "events">("news");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { content: newsContent } = usePageSettings<NewsContent>("news", {});
  const [dbArticles, setDbArticles] = useState<NewsArticle[] | null>(initialArticles ?? null);
  const [dbEvents, setDbEvents] = useState<FoundationEvent[] | null>(initialEvents ?? null);

  useEffect(() => {
    if (initialArticles && initialEvents) return; // SSR-provided; skip client fetch
    supabase
      .from("news_articles")
      .select("slug, title, excerpt, body_md, cover_image, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        const rows = (data || []).map(
          (r): NewsArticle => ({
            id: r.slug,
            title: r.title,
            summary: r.excerpt || "",
            content: r.body_md || "",
            date: formatDate(r.published_at),
            author: "MDF Team",
            category: "Dispatch",
            image: r.cover_image || "",
            readTime: estimateReadTime(r.body_md),
          }),
        );
        setDbArticles(rows);
      });
    supabase
      .from("events")
      .select("slug, title, description, cover_image, starts_at, ends_at, location")
      .eq("status", "published")
      .order("starts_at", { ascending: false })
      .then(({ data }) => {
        const now = Date.now();
        const rows = (data || []).map((r): FoundationEvent => {
          const startMs = r.starts_at ? new Date(r.starts_at).getTime() : 0;
          return {
            id: r.slug,
            title: r.title,
            date: formatDate(r.starts_at),
            time: formatTime(r.starts_at),
            location: r.location || "",
            type: startMs >= now ? "upcoming" : "past",
            category: "Event",
            description: r.description || "",
            image: r.cover_image || "",
          };
        });
        setDbEvents(rows);
      });
  }, []);

  const articles = useMemo(
    () => (dbArticles && dbArticles.length > 0 ? dbArticles : newsContent?.articles || []),
    [dbArticles, newsContent],
  );
  const events = useMemo(
    () => (dbEvents && dbEvents.length > 0 ? dbEvents : newsContent?.events || []),
    [dbEvents, newsContent],
  );

  // Event RSVP Simulator State
  const [rsvpEvent, setRsvpEvent] = useState<FoundationEvent | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const submitEventRsvpFn = useServerFn(submitEventRsvp);

  const isArticleView = !!articleId;
  const currentArticle = articleId ? articles.find((a) => String(a.id) === articleId) : null;

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpEmail || !rsvpEvent) return;
    setRsvpError("");
    setRsvpSubmitting(true);
    try {
      await submitEventRsvpFn({
        data: {
          eventExternalId: String(rsvpEvent.id ?? ""),
          eventTitle: rsvpEvent.title,
          fullName: rsvpName,
          email: rsvpEmail,
          phone: rsvpPhone,
        },
      });
      setRsvpSubmitted(true);
      setTimeout(() => {
        setRsvpSubmitted(false);
        setRsvpEvent(null);
        setRsvpName("");
        setRsvpEmail("");
        setRsvpPhone("");
      }, 4000);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  if (isArticleView && currentArticle) {
    // Render individual Article view
    return (
      <div className="space-y-12 py-10 animate-fade-in max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate({ to: "/news" })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Dispatches & Events</span>
          </button>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md">
              {currentArticle.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {currentArticle.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {currentArticle.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-900">
                <User className="w-4 h-4 text-blue-600" /> By {currentArticle.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" /> {currentArticle.date}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Link Copied!" : "Share Dispatch"}</span>
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden bg-slate-100 shadow-md max-h-[450px]">
          <img
            src={currentArticle.image}
            alt={currentArticle.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Prose Content */}
        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-6">
          <p className="text-base sm:text-lg font-semibold text-slate-900 border-l-4 border-blue-600 pl-4 py-1">
            {currentArticle.summary}
          </p>

          {currentArticle.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Footer Engagement */}
        <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Inspired by this dispatch?</h2>
            <p className="text-xs text-slate-600 mt-1">
              Your contribution allows us to continue organizing these life-saving interventions.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/donate" })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shrink-0"
          >
            Support This Program
          </button>
        </div>

        {/* Related Articles */}
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            More Dispatches from the Field
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {articles
              .filter((a) => a.id !== currentArticle.id)
              .slice(0, 2)
              .map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    navigate({ to: "/news/$slug", params: { slug: String(article.id) } });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-all flex gap-4 items-center group"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">
                      {article.category}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-0.5">
                      {article.title}
                    </h4>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Core Archive Tabs
  const newsCategories = ["all", ...Array.from(new Set(articles.map((a) => a.category)))];
  const filteredArticles =
    selectedCategory === "all" ? articles : articles.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-12 py-10 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
          Foundation Chronicle
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          News & Foundation Events
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Stay fully updated on our ground-level outreach programs, field-distribution schedules,
          and continuous humanitarian initiatives.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs font-semibold">
          <a
            href="/news/archive"
            className="text-blue-700 hover:text-blue-900 hover:underline"
          >
            Browse full archive →
          </a>
          <a
            href="/rss.xml"
            className="text-blue-700 hover:text-blue-900 hover:underline"
          >
            Subscribe via RSS
          </a>
        </div>
      </div>

      {/* Event structured data for upcoming events */}
      {events.filter((e) => e.type === "upcoming").length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              events
                .filter((e) => e.type === "upcoming")
                .map((e) => ({
                  "@context": "https://schema.org",
                  "@type": "Event",
                  name: e.title,
                  startDate: e.date,
                  location: {
                    "@type": "Place",
                    name: e.location || "Manyang Disability Foundation",
                  },
                  description: e.description,
                  image: e.image || undefined,
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                  organizer: {
                    "@type": "Organization",
                    name: "Manyang Disability Foundation",
                    url: "https://manyangdisabilityfoundation.org",
                  },
                })),
            ).replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--"),
          }}
        />
      )}

      {/* Main Mode Switches */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1 max-w-md w-full">
          <button
            onClick={() => setActiveTab("news")}
            className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === "news"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Latest News</span>
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === "events"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Upcoming & Past Events</span>
          </button>
        </div>
      </div>

      {/* TAB 1: News Archive */}
      {activeTab === "news" && (
        <div className="space-y-8 animate-fade-in">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center border-b border-slate-200 pb-6">
            {newsCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                  selectedCategory === cat
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat === "all" ? "All Dispatches" : cat}
              </button>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() =>
                  navigate({ to: "/news/$slug", params: { slug: String(article.id) } })
                }
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-52 w-full relative overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-blue-900 text-[11px] font-bold px-2.5 py-1 rounded shadow-xs">
                      {article.category}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {article.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">By {article.author}</span>
                  <span className="text-blue-600 font-bold flex items-center gap-1">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Foundation Events */}
      {activeTab === "events" && (
        <div className="space-y-12 animate-fade-in">
          {/* Upcoming section */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row justify-between items-baseline gap-2">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                  Get Involved Directly
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  Upcoming Distribution & Outreach Events
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Reservations open for certified applicants & volunteers
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {events
                .filter((e) => e.type === "upcoming")
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 w-full relative">
                        <img
                          src={evt.image}
                          alt={evt.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                          Upcoming Event
                        </div>
                        {evt.seatsAvailable && (
                          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-blue-900 text-xs font-bold px-2.5 py-1 rounded shadow-xs flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>{evt.seatsAvailable} spots remaining</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-3">
                        <span className="text-xs font-bold text-blue-600 block">
                          {evt.category}
                        </span>
                        <h4 className="font-bold text-lg text-slate-900 leading-tight">
                          {evt.title}
                        </h4>

                        <div className="space-y-1.5 text-xs text-slate-600 py-2 border-y border-slate-100">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-medium text-slate-900">{evt.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.time}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{evt.location}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                      <button
                        onClick={() => setRsvpEvent(evt)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-xs"
                      >
                        Reserve Attendee / Volunteer Spot
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Past Event Chronicles */}
          <div className="space-y-6 pt-6">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Archive
              </span>
              <h3 className="text-xl font-bold text-slate-900">Past Impact Events</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events
                .filter((e) => e.type === "past")
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-5 items-center"
                  >
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full sm:w-32 h-32 rounded-lg object-cover shrink-0"
                    />
                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {evt.category}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {evt.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{evt.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {evt.description}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Successfully concluded</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* RSVP Simulator Lightbox */}
      {rsvpEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="bg-blue-900 text-white p-6 relative">
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block">
                Event Registration
              </span>
              <h3 className="text-lg font-bold mt-1">{rsvpEvent.title}</h3>
              <p className="text-blue-200 text-xs mt-1">
                {rsvpEvent.date} • {rsvpEvent.location}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {rsvpSubmitted ? (
                <div className="text-center space-y-3 py-6 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900">Registration Received!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Your RSVP has been recorded under <strong>{rsvpEmail}</strong>. Our logistics
                    desk will follow up with check-in details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Enter your name"
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
                      value={rsvpEmail}
                      onChange={(e) => setRsvpEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={rsvpPhone}
                      onChange={(e) => setRsvpPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500">
                    Spots are verified internally by our logistics desk. Please arrive 15 minutes
                    prior to start time for check-in.
                  </div>

                  {rsvpError && <p className="text-xs text-red-600 font-medium">{rsvpError}</p>}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRsvpEvent(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={rsvpSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-xs transition-colors"
                    >
                      {rsvpSubmitting ? "Submitting…" : "Confirm Reservation"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
