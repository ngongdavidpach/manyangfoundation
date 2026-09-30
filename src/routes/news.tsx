import { createFileRoute } from "@tanstack/react-router";
import { NewsView } from "../ported/components/views/NewsView";
import { getPageSeo, type PageSeo } from "../lib/pageSeo.functions";
import { buildRouteHead } from "../lib/routeHead";
import { listPublishedArticles, listPublicEvents } from "../lib/publicContent.functions";
import type { NewsArticle, FoundationEvent } from "../ported/data/foundationData";

function estimateReadTime(text: string | null | undefined): string {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}
function fmtDate(iso: string | null | undefined) {
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
function fmtTime(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/news")({
  loader: async () => {
    const [seo, rawArticles, rawEvents] = await Promise.all([
      getPageSeo({ data: { pageKey: "news" } }).catch((): PageSeo => ({})),
      listPublishedArticles().catch(() => []),
      listPublicEvents().catch(() => []),
    ]);
    const articles: NewsArticle[] = rawArticles.map((r) => ({
      id: r.slug,
      title: r.title,
      summary: r.excerpt || "",
      content: "",
      date: fmtDate(r.published_at),
      author: "MDF Team",
      category: "Dispatch",
      image: r.cover_image || "",
      readTime: estimateReadTime(r.excerpt),
    }));
    const now = Date.now();
    const events: FoundationEvent[] = rawEvents.map((r) => {
      const startMs = r.starts_at ? new Date(r.starts_at).getTime() : 0;
      return {
        id: r.slug,
        title: r.title,
        date: fmtDate(r.starts_at),
        time: fmtTime(r.starts_at),
        location: r.location || "",
        type: startMs >= now ? "upcoming" : "past",
        category: r.category || "Event",
        description: r.description || "",
        image: r.cover_image || "",
      };
    });
    return { seo, articles, events };
  },
  head: ({ loaderData }) => {
    const base = buildRouteHead({
      path: "/news",
      defaultTitle: "News & Events — Manyang Disability Foundation",
      defaultDescription: "Field dispatches, outreach updates, and upcoming foundation events.",
      seo: loaderData?.seo,
    });
    const articles = loaderData?.articles ?? [];
    if (!articles.length) return base;
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: articles.slice(0, 20).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://manyangdisabilityfoundation.org/news/${a.id}`,
        name: a.title,
      })),
    };
    return {
      ...base,
      scripts: [
        ...((base as any).scripts ?? []),
        { type: "application/ld+json", children: JSON.stringify(itemList) },
      ],
    };
  },
  errorComponent: () => (
    <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
      Could not load news right now.
    </div>
  ),
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">Not found.</div>
  ),
  component: NewsRoute,
});

function NewsRoute() {
  const { articles, events } = Route.useLoaderData();
  return <NewsView initialArticles={articles} initialEvents={events} />;
}
