// Guarded service worker registration. Refuses to register in dev, Lovable previews,
// iframes, or when ?sw=off. Unregisters stale workers in those contexts.

const STALE_SW_PATHS = ["/sw.js"];

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (
    new URLSearchParams(window.location.search).has("sw") &&
    new URLSearchParams(window.location.search).get("sw") === "off"
  )
    return true;
  return false;
}

async function unregisterStale() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return STALE_SW_PATHS.some((p) => url.endsWith(p));
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (shouldSkip()) {
    void unregisterStale();
    return;
  }
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* noop */
    });
  });
}
