import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getFoundationInfoTool from "./tools/get-foundation-info";
import listNewsTool from "./tools/list-news";

// The OAuth issuer MUST be the direct Supabase host. VITE_SUPABASE_PROJECT_ID is
// inlined by Vite at build time; the fallback keeps the issuer well-formed
// during the throwaway manifest-extract eval.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "manyang-foundation-mcp",
  title: "Manyang Disability Foundation",
  version: "0.1.0",
  instructions:
    "Tools for the Manyang Disability Foundation. Callers sign in with their foundation account; tools act as that user, subject to the app's row-level security. Use `get_foundation_info` for public mission/contact details and `list_news` to browse published news articles.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getFoundationInfoTool, listNewsTool],
});
