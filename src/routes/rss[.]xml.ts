import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://manyangdisabilityfoundation.org";

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const items: string[] = [];
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const client = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data: articles } = await client
            .from("news_articles")
            .select("slug, title, excerpt, published_at, cover_image")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(20);
          for (const a of (articles as Array<{
            slug: string;
            title: string;
            excerpt: string | null;
            published_at: string | null;
            cover_image: string | null;
          }>) || []) {
            const link = `${BASE_URL}/news/${a.slug}`;
            const pub = a.published_at ? new Date(a.published_at).toUTCString() : "";
            items.push(
              [
                `  <item>`,
                `    <title>${esc(a.title)}</title>`,
                `    <link>${link}</link>`,
                `    <guid isPermaLink="true">${link}</guid>`,
                pub ? `    <pubDate>${pub}</pubDate>` : "",
                `    <description>${esc(a.excerpt || a.title)}</description>`,
                a.cover_image ? `    <enclosure url="${esc(a.cover_image)}" type="image/jpeg" />` : "",
                `    <category>News</category>`,
                `  </item>`,
              ]
                .filter(Boolean)
                .join("\n"),
            );
          }

          const { data: events } = await client
            .from("events")
            .select("slug, title, description, starts_at, cover_image")
            .eq("status", "published")
            .gte("starts_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
            .order("starts_at", { ascending: false })
            .limit(20);
          for (const e of (events as Array<{
            slug: string;
            title: string;
            description: string | null;
            starts_at: string;
            cover_image: string | null;
          }>) || []) {
            const link = `${BASE_URL}/news#event-${e.slug}`;
            const pub = e.starts_at ? new Date(e.starts_at).toUTCString() : "";
            items.push(
              [
                `  <item>`,
                `    <title>Event: ${esc(e.title)}</title>`,
                `    <link>${link}</link>`,
                `    <guid isPermaLink="false">event-${e.slug}</guid>`,
                pub ? `    <pubDate>${pub}</pubDate>` : "",
                `    <description>${esc(e.description || e.title)}</description>`,
                `    <category>Event</category>`,
                `  </item>`,
              ]
                .filter(Boolean)
                .join("\n"),
            );
          }
        } catch {}

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `<channel>`,
          `  <title>Manyang Disability Foundation — News &amp; Events</title>`,
          `  <link>${BASE_URL}/news</link>`,
          `  <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
          `  <description>Field dispatches, outreach updates, and upcoming foundation events.</description>`,
          `  <language>en</language>`,
          `  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
          ...items,
          `</channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
          },
        });
      },
    },
  },
});
