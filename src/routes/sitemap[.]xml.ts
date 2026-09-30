import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://manyangdisabilityfoundation.org";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/programs", changefreq: "monthly", priority: "0.8" },
          { path: "/gallery", changefreq: "monthly", priority: "0.6" },
          { path: "/news", changefreq: "weekly", priority: "0.7" },
          { path: "/get-involved", changefreq: "monthly", priority: "0.7" },
          { path: "/donate", changefreq: "monthly", priority: "0.9" },
          { path: "/request", changefreq: "monthly", priority: "0.7" },
          { path: "/guides/free-medical-equipment", changefreq: "monthly", priority: "0.7" },
          { path: "/guides/donate-supplies", changefreq: "monthly", priority: "0.7" },
          { path: "/guides/mobility-aid-grants", changefreq: "monthly", priority: "0.7" },
          { path: "/faq/donations", changefreq: "monthly", priority: "0.7" },
          { path: "/news/archive", changefreq: "weekly", priority: "0.6" },
          { path: "/csr-sponsorship", changefreq: "monthly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/events", changefreq: "weekly", priority: "0.7" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/privacy/emails", changefreq: "yearly", priority: "0.3" },

        ];
        // /portal/* routes are noindex and intentionally excluded from the sitemap.

        // News articles
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const client = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await client
            .from("news_articles")
            .select("slug")
            .eq("status", "published");
          for (const a of (data as Array<{ slug: string }>) || []) {
            entries.push({ path: `/news/${a.slug}`, changefreq: "monthly", priority: "0.6" });
          }
          const { data: eventsData } = await client
            .from("events")
            .select("slug")
            .eq("status", "published");
          for (const e of (eventsData as Array<{ slug: string }>) || []) {
            entries.push({ path: `/events/${e.slug}`, changefreq: "weekly", priority: "0.6" });
          }

          // Program pages (admin-editable focus areas)
          const { data: programsPage } = await client
            .from("page_settings")
            .select("content")
            .eq("page_key", "programs")
            .eq("published", true)
            .maybeSingle();
          const { normalizeFocusAreas } = await import("@/ported/lib/focusAreas");
          for (const p of normalizeFocusAreas(
            (programsPage?.content as { focusAreas?: unknown } | null)?.focusAreas,
          )) {
            if (p.slug) {
              entries.push({ path: `/programs/${p.slug}`, changefreq: "monthly", priority: "0.7" });
            }
          }
        } catch {}

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
