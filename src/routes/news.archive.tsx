import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;

type ArchiveArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  cover_image: string | null;
};

const fetchArchive = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ page: z.number().int().min(1), year: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    let query = client
      .from("news_articles")
      .select("slug, title, excerpt, published_at, cover_image", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (data.year !== "all") {
      const y = parseInt(data.year, 10);
      if (!Number.isNaN(y)) {
        query = query
          .gte("published_at", `${y}-01-01T00:00:00Z`)
          .lt("published_at", `${y + 1}-01-01T00:00:00Z`);
      }
    }
    const from = (data.page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data: rows, count } = await query.range(from, to);

    const { data: yearRows } = await client
      .from("news_articles")
      .select("published_at")
      .eq("status", "published")
      .not("published_at", "is", null);
    const years = Array.from(
      new Set(
        (yearRows as Array<{ published_at: string | null }> | null || [])
          .map((r) => (r.published_at ? new Date(r.published_at).getFullYear().toString() : null))
          .filter((y): y is string => !!y),
      ),
    ).sort((a, b) => b.localeCompare(a));

    return {
      articles: (rows as ArchiveArticle[] | null) || [],
      total: count || 0,
      years,
    };
  });

type ArchiveSearch = { page: number; year: string };

export const Route = createFileRoute("/news/archive")({
  validateSearch: (search: Record<string, unknown>): ArchiveSearch => {
    const rawPage = Number(search.page);
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
    const year = typeof search.year === "string" && search.year.length > 0 ? search.year : "all";
    return { page, year };
  },
  head: () => ({
    meta: [
      { title: "News Archive — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Browse all field dispatches and foundation news, filtered by year with pagination.",
      },
      { property: "og:title", content: "News Archive — Manyang Disability Foundation" },
      {
        property: "og:description",
        content: "Browse the full archive of field reports and foundation news.",
      },
      { property: "og:url", content: "https://manyangdisabilityfoundation.org/news/archive" },
    ],
    links: [{ rel: "canonical", href: "https://manyangdisabilityfoundation.org/news/archive" }],
  }),
  loaderDeps: ({ search: { page, year } }) => ({ page, year }),
  loader: ({ deps }) => fetchArchive({ data: deps }),
  component: ArchivePage,
});

function ArchivePage() {
  const { page, year } = Route.useSearch();
  const state = Route.useLoaderData();

  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  const filters = ["all", ...state.years];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="space-y-3">
        <Link to="/news" className="text-xs font-bold text-blue-600 hover:text-blue-800">
          ← Back to News & Events
        </Link>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          News & Field Reports Archive
        </h1>
        <p className="text-base text-slate-600">
          Every published dispatch from the Manyang Disability Foundation.
        </p>
        <p className="text-xs text-slate-500">
          Subscribe via{" "}
          <a href="/rss.xml" className="text-blue-600 hover:underline font-semibold">
            RSS feed
          </a>{" "}
          to follow new posts automatically.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {filters.map((y) => (
          <Link
            key={y}
            to="/news/archive"
            search={{ page: 1, year: y }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              year === y
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {y === "all" ? "All years" : y}
          </Link>
        ))}
      </div>

      {state.articles.length === 0 ? (
        <p className="text-sm text-slate-500">No articles found for this filter.</p>
      ) : (
        <ul className="space-y-6">
          {state.articles.map((a: ArchiveArticle) => (
            <li
              key={a.slug}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:border-blue-300 transition-colors"
            >
              {a.cover_image && (
                <img
                  src={a.cover_image}
                  alt={a.title}
                  className="w-full sm:w-48 h-32 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs text-slate-500">
                  {a.published_at
                    ? new Date(a.published_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  <Link
                    to="/news/$slug"
                    params={{ slug: a.slug }}
                    className="hover:text-blue-700"
                  >
                    {a.title}
                  </Link>
                </h2>
                {a.excerpt && (
                  <p className="text-sm text-slate-600 line-clamp-3">{a.excerpt}</p>
                )}
                <Link
                  to="/news/$slug"
                  params={{ slug: a.slug }}
                  className="inline-block text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Read dispatch →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={page > 1 ? `/news/archive?page=${page - 1}&year=${year}` : "#"}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              return (
                <PaginationItem key={n}>
                  <PaginationLink
                    href={`/news/archive?page=${n}&year=${year}`}
                    isActive={n === page}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href={page < totalPages ? `/news/archive?page=${page + 1}&year=${year}` : "#"}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
