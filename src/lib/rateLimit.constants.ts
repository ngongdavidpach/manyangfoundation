// Client-safe constants (no server-only imports). Both server and client
// modules can import from here without pulling server-only code into the
// client bundle graph.

export const RATE_LIMIT_MESSAGE =
  "Too many requests. Please try again in a few minutes.";
