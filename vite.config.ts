import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { createLogger } from "vite";

// NOTE: vite-plugin-pwa is intentionally not used here. It assumes a
// classic SPA build with index.html as the entry, which TanStack Start
// does not have (SSR via Nitro). A static service worker can be added
// under public/sw.js if PWA behavior is needed later.

// Silence harmless "use client" directive warnings from libraries like
// @tanstack/react-router. They surface from multiple build stages
// (client bundle, SSR bundle, Nitro worker bundle), so we filter via a
// custom Vite logger which sees every stage's output.
const logger = createLogger();
const originalWarn = logger.warn;
const originalWarnOnce = logger.warnOnce;
const shouldIgnore = (msg: string) => msg.includes('"use client"') || msg.includes("'use client'");
logger.warn = (msg, opts) => {
  if (shouldIgnore(msg)) return;
  originalWarn(msg, opts);
};
logger.warnOnce = (msg, opts) => {
  if (shouldIgnore(msg)) return;
  originalWarnOnce(msg, opts);
};

export default defineConfig({
  vite: {
    customLogger: logger,
    plugins: [mcpPlugin()],
  },
});
