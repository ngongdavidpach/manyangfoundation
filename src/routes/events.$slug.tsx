import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { getPublicEvent } from "../lib/publicContent.functions";
import { EventRsvpForm } from "../ported/components/EventRsvpForm";

const FALLBACK_IMG = "https://manyangdisabilityfoundation.org/images/logo.png";
function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ params }) => {
    const event = await getPublicEvent({ data: { slug: params.slug } });
    if (!event) throw notFound();
    return { event };
  },
  head: ({ params, loaderData }) => {
    const e = loaderData?.event;
    const url = `https://manyangdisabilityfoundation.org/events/${params.slug}`;
    const title = truncate(`${e?.title ?? "Event"} — MDF Events`, 60);
    const desc = truncate(
      e?.description || "An event hosted by the Manyang Disability Foundation.",
      160,
    );
    const image = e?.cover_image || FALLBACK_IMG;
    const scripts = e
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: e.title,
              startDate: e.starts_at,
              endDate: e.ends_at ?? undefined,
              location: e.location
                ? { "@type": "Place", name: e.location }
                : undefined,
              image: e.cover_image ? [e.cover_image] : undefined,
              description: e.description ?? undefined,
              url,
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              organizer: {
                "@type": "Organization",
                name: "Manyang Disability Foundation",
                url: "https://manyangdisabilityfoundation.org",
              },
            }),
          },
        ]
      : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto p-12 text-center">
      <p className="text-slate-500">Event not found.</p>
      <Link to="/events" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        ← Back to events
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
      Could not load this event. Please try again.
    </div>
  ),
  component: EventDetail,
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function EventDetail() {
  const { event: e } = Route.useLoaderData();
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/events" className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Back to events
      </Link>
      {e.cover_image && (
        <img src={e.cover_image} alt="" className="w-full h-64 sm:h-80 object-cover rounded-2xl" />
      )}
      <header className="space-y-3">
        {e.category && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold capitalize">
            {e.category}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {e.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" /> {fmtDate(e.starts_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {fmtTime(e.starts_at)}
            {e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ""}
          </span>
          {e.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {e.location}
            </span>
          )}
        </div>
      </header>
      {e.description && (
        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
          {e.description}
        </div>
      )}
      {e.rsvp_url && (
        <a
          href={e.rsvp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-md"
        >
          RSVP via external site <ExternalLink className="w-4 h-4" />
        </a>
      )}
      <EventRsvpForm eventId={e.id} eventTitle={e.title} />
    </article>
  );
}
