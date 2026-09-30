import { createFileRoute } from "@tanstack/react-router";
import { EventsCalendarView } from "../ported/components/views/EventsCalendarView";
import { listPublicEvents } from "../lib/publicContent.functions";

export const Route = createFileRoute("/events")({
  loader: () => listPublicEvents(),
  head: ({ loaderData }) => {
    const events = loaderData ?? [];
    const jsonLd = events.slice(0, 20).map((e) => ({
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
      url: `https://manyangdisabilityfoundation.org/events/${e.slug}`,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: {
        "@type": "Organization",
        name: "Manyang Disability Foundation",
        url: "https://manyangdisabilityfoundation.org",
      },
    }));
    return {
      meta: [
        { title: "Events Calendar — Manyang Disability Foundation" },
        {
          name: "description",
          content:
            "Upcoming fundraisers, awareness days, and community events supporting the Manyang Disability Foundation.",
        },
        { property: "og:title", content: "Events Calendar — MDF" },
        {
          property: "og:description",
          content: "Fundraisers, awareness days, and community events.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://manyangdisabilityfoundation.org/events" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: "https://manyangdisabilityfoundation.org/events" }],
      scripts: jsonLd.length
        ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }]
        : undefined,
    };
  },
  component: EventsRoute,
});

function EventsRoute() {
  const events = Route.useLoaderData();
  return <EventsCalendarView events={events} />;
}
