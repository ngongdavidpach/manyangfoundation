import { createFileRoute, notFound } from "@tanstack/react-router";
import { NewsView } from "../ported/components/views/NewsView";
import { getPublishedArticle, listPublicEvents } from "../lib/publicContent.functions";
import type { NewsArticle, FoundationEvent } from "../ported/data/foundationData";

const FALLBACK_TITLE = "Dispatch — MDF News";
const FALLBACK_DESC = "Field dispatch from the Manyang Disability Foundation.";
const FALLBACK_IMG = "https://manyangdisabilityfoundation.org/images/logo.png";

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
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
function estimateReadTime(text: string | null | undefined): string {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const [article, rawEvents] = await Promise.all([
      getPublishedArticle({ data: { slug: params.slug } }),
      listPublicEvents().catch(() => []),
    ]);
    if (!article) throw notFound();
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
    const articles: NewsArticle[] = [
      {
        id: article.slug,
        title: article.title,
        summary: article.excerpt || "",
        content: article.body_md || "",
        date: fmtDate(article.published_at),
        author: "MDF Team",
        category: "Dispatch",
        image: article.cover_image || "",
        readTime: estimateReadTime(article.body_md),
      },
    ];
    return { article, articles, events };
  },
  head: ({ params, loaderData }) => {
    const url = `https://manyangdisabilityfoundation.org/news/${params.slug}`;
    const a = loaderData?.article ?? null;
    const rawTitle = a?.title ?? FALLBACK_TITLE;
    const title = truncate(`${rawTitle} — MDF News`, 60);
    const desc = truncate(a?.excerpt || FALLBACK_DESC, 160);
    const image = a?.cover_image || FALLBACK_IMG;

    const meta = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:site_name", content: "Manyang Disability Foundation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: image },
    ];

    const scripts = a
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: a.title,
              description: a.excerpt || undefined,
              image: a.cover_image ? [a.cover_image] : undefined,
              datePublished: a.published_at || undefined,
              dateModified: a.published_at || undefined,
              author: [{ "@type": "Organization", name: "Manyang Disability Foundation" }],
              publisher: {
                "@type": "Organization",
                name: "Manyang Disability Foundation",
                logo: {
                  "@type": "ImageObject",
                  url: "https://manyangdisabilityfoundation.org/images/logo.png",
                },
              },
              mainEntityOfPage: { "@type": "WebPage", "@id": url },
            }),
          },
        ]
      : undefined;

    return { meta, links: [{ rel: "canonical", href: url }], scripts };
  },
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
      Article not found.
    </div>
  ),
  errorComponent: () => (
    <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
      Could not load this article. Please try again.
    </div>
  ),
  component: ArticleRoute,
});

function ArticleRoute() {
  const { slug } = Route.useParams();
  const { articles, events } = Route.useLoaderData();
  return <NewsView articleId={slug} initialArticles={articles} initialEvents={events} />;
}
