import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_foundation_info",
  title: "Get foundation info",
  description:
    "Return public information about the Manyang Disability Foundation — mission, focus areas, and contact details. Requires sign-in; the response is scoped to what the signed-in user is allowed to see.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    let dbInfo: unknown = null;
    if (supabaseUrl && key) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/foundation_info?select=*&limit=1`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${ctx.getToken()}`,
          },
        });
        if (res.ok) dbInfo = (await res.json())?.[0] ?? null;
      } catch {
        // ignore, return static fallback
      }
    }
    const payload = dbInfo ?? {
      name: "Manyang Disability Foundation",
      url: "https://manyangdisabilityfoundation.org",
      mission:
        "Support persons with disabilities through mobility aids, healthcare access, inclusive education, and sustainable livelihoods.",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: { info: payload },
    };
  },
});
