import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";

function serverClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) return null;
  return createClient<any>(url, key);
}

function getIp(request: Request): string | null {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    null
  );
}

export const Route = createFileRoute("/api/public/cookie-consent-log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabase = serverClient();
        if (!supabase) return Response.json({ ok: false }, { status: 500 });
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const details: Record<string, unknown> = {
          necessary: true,
          analytics: !!body.analytics,
          marketing: !!body.marketing,
          source: typeof body.source === "string" ? body.source.slice(0, 32) : "banner",
        };

        // Optionally attach user identity if a bearer token is present
        let userId: string | null = null;
        let email: string | null = null;
        const auth = request.headers.get("authorization");
        if (auth?.startsWith("Bearer ")) {
          const jwt = auth.slice("Bearer ".length).trim();
          const { data } = await supabase.auth.getUser(jwt);
          if (data?.user) {
            userId = data.user.id;
            email = data.user.email ? data.user.email.toLowerCase() : null;
          }
        }

        // Simple per-IP rate limit (30 / hour) to prevent spam
        const ip = getIp(request);
        if (ip) {
          const { data: allowed } = await supabase.rpc("check_rate_limit", {
            _key: ip,
            _bucket: "cookie_consent_log",
            _max: 30,
            _window_seconds: 3600,
          });
          if (allowed === false) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
        }

        const { error } = await supabase.from("user_activity_log").insert({
          user_id: userId,
          email,
          event_type: "cookie_consent_updated",
          details,
          ip,
          user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
        });
        if (error) {
          console.error("cookie-consent-log insert failed", error);
          return Response.json({ ok: false }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
