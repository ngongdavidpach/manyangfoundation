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

export const Route = createFileRoute("/programs/rss.xml")({
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
          const { data: page } = await client
            .from("page_settings")
            .select("content, updated_at")
            .eq("page_key", "programs")
            .eq("published", true)
            .maybeSingle();
          const content = (page?.content as { focusAreas?: unknown } | null) || null;
          const { normalizeFocusAreas } = await import("@/ported/lib/focusAreas");
          const programs = normalizeFocusAreas(content?.focusAreas);
          const updated = page?.updated_at ? new Date(page.updated_at).toUTCString() : new Date().toUTCString();

          for (const p of programs) {
            const id = p.slug || (p.title || "").toLowerCase().replace(/\s+/g, "-");
            const link = `${BASE_URL}/programs/${id}`;
            items.push(
              [
                `  <item>`,
                `    <title>${esc(p.title || "Program")}</title>`,
                `    <link>${link}</link>`,
                `    <guid isPermaLink="false">program-${id}</guid>`,
                `    <pubDate>${updated}</pubDate>`,
                `    <description>${esc(p.description || p.title || "")}</description>`,
                `    <category>Program</category>`,
                `  </item>`,
              ].join("\n"),
            );
          }
        } catch {}

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `<channel>`,
          `  <title>Manyang Disability Foundation — Programs</title>`,
          `  <link>${BASE_URL}/programs</link>`,
          `  <atom:link href="${BASE_URL}/programs.rss.xml" rel="self" type="application/rss+xml" />`,
          `  <description>Updates on mobility aids, surgical assistance, inclusive education, and livelihood programs.</description>`,
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
