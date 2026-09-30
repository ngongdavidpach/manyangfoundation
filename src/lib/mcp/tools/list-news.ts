import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_news",
  title: "List news articles",
  description:
    "List the most recent published news articles from the foundation website. Requires sign-in; row-level security decides which articles the signed-in user can see.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Max number of articles."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !key) {
      return { content: [{ type: "text", text: "Backend not configured" }], isError: true };
    }
    const url = `${supabaseUrl}/rest/v1/news?select=id,slug,title,excerpt,published_at&order=published_at.desc&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${ctx.getToken()}`,
      },
    });
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Failed to fetch news: ${res.status}` }],
        isError: true,
      };
    }
    const rows = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { articles: rows },
    };
  },
});
