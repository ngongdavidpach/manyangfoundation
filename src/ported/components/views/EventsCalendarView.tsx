import React, { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock, ExternalLink, Filter } from "lucide-react";
import type { PublicEvent } from "@/lib/publicContent.functions";

type Props = { events: PublicEvent[] };

const CATEGORIES = ["all", "fundraiser", "awareness", "community", "training", "other"] as const;
type Cat = (typeof CATEGORIES)[number];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function monthKey(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export const EventsCalendarView: React.FC<Props> = ({ events }) => {
  const [cat, setCat] = useState<Cat>("all");
  const now = Date.now();

  const filtered = useMemo(
    () =>
      events.filter((e) => cat === "all" || (e.category ?? "other").toLowerCase() === cat),
    [events, cat],
  );

  const upcoming = filtered.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = filtered
    .filter((e) => new Date(e.starts_at).getTime() < now)
    .sort((a, b) => (a.starts_at < b.starts_at ? 1 : -1));

  // group upcoming by month
  const grouped = useMemo(() => {
    const m = new Map<string, PublicEvent[]>();
    for (const e of upcoming) {
      const k = monthKey(e.starts_at);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return Array.from(m.entries());
  }, [upcoming]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Events Calendar
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          Fundraisers, awareness days, community meet-ups, and training sessions across the
          Manyang Disability Foundation network.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
              cat === c
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {c === "all" ? "All events" : c}
          </button>
        ))}
      </div>

      <section aria-labelledby="upcoming-events" className="space-y-6">
        <h2 id="upcoming-events" className="text-xl font-bold text-slate-900">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No upcoming events in this category yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-8">
            {grouped.map(([month, items]) => (
              <div key={month} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                  {month}
                </h3>
                <ul className="space-y-4">
                  {items.map((e) => (
                    <EventCard key={e.id} e={e} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-events" className="space-y-4">
          <h2 id="past-events" className="text-xl font-bold text-slate-900">
            Past events
          </h2>
          <ul className="space-y-3">
            {past.slice(0, 12).map((e) => (
              <li
                key={e.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 flex justify-between items-center gap-4"
              >
                <div>
                  <Link
                    to="/events/$slug"
                    params={{ slug: e.slug }}
                    className="font-semibold text-slate-800 hover:text-blue-700"
                  >
                    {e.title}
                  </Link>
                  <p className="text-xs text-slate-500">{fmtDate(e.starts_at)}</p>
                </div>
                {e.location && (
                  <span className="text-xs text-slate-500 hidden sm:inline">{e.location}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

const EventCard: React.FC<{ e: PublicEvent }> = ({ e }) => (
  <li className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:border-blue-300 transition-colors">
    {e.cover_image && (
      <img
        src={e.cover_image}
        alt=""
        className="w-full sm:w-40 h-32 object-cover rounded-lg shrink-0"
      />
    )}
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex flex-wrap gap-2 items-center text-xs">
        {e.category && (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold capitalize">
            {e.category}
          </span>
        )}
        <span className="text-slate-500 flex items-center gap-1">
          <CalendarDays className="w-3 h-3" />
          {fmtDate(e.starts_at)}
        </span>
        <span className="text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {fmtTime(e.starts_at)}
          {e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ""}
        </span>
      </div>
      <h4 className="text-lg font-bold text-slate-900">
        <Link
          to="/events/$slug"
          params={{ slug: e.slug }}
          className="hover:text-blue-700"
        >
          {e.title}
        </Link>
      </h4>
      {e.location && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {e.location}
        </p>
      )}
      {e.description && (
        <p className="text-sm text-slate-600 line-clamp-3">{e.description}</p>
      )}
      {e.rsvp_url && (
        <a
          href={e.rsvp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
        >
          RSVP <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  </li>
);
