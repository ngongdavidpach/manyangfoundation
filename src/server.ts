import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.lovable.app https://*.lovable.dev https://challenges.cloudflare.com https://restcountries.com",
    "frame-src 'self' https://challenges.cloudflare.com",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}


const PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()";

declare const HTMLRewriter: {
  new (): {
    on(
      selector: string,
      handlers: { element(el: { setAttribute(name: string, value: string): void }): void },
    ): { transform(response: Response): Response };
  };
};

async function stampNonceOnHtml(response: Response, nonce: string): Promise<Response> {
  if (typeof HTMLRewriter !== "undefined") {
    const rewriter = new HTMLRewriter().on("script", {
      element(el) {
        el.setAttribute("nonce", nonce);
      },
    });
    return rewriter.transform(response);
  }

  // Non-Worker runtimes (preview/dev on Node) have no HTMLRewriter. Without a
  // nonce on the inline bootstrap script the strict CSP blocks hydration and
  // the page renders blank, so rewrite the HTML as text instead.
  const html = await response.text();
  const patched = html.replace(/<script\b([^>]*)>/gi, (match, attrs: string) => {
    if (/\snonce\s*=/i.test(attrs)) return match;
    return `<script nonce="${nonce}"${attrs}>`;
  });
  return new Response(patched, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function applySecurityHeaders(response: Response, request: Request): Promise<Response> {
  const nonce = generateNonce();
  const contentType = response.headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html");

  const stamped = isHtml ? await stampNonceOnHtml(response, nonce) : response;

  const headers = new Headers(stamped.headers);
  headers.set("Content-Security-Policy", buildCsp(nonce));
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  if (new URL(request.url).protocol === "https:") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
  return new Response(stamped.body, {
    status: stamped.status,
    statusText: stamped.statusText,
    headers,
  });
}


export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applySecurityHeaders(normalized, request);
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        request,
      );
    }
  },
};

