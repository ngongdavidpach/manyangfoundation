import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PageSeo = {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
};

export const getPageSeo = createServerFn({ method: "GET" })
  .validator((data: { pageKey: string }) => data)
  .handler(async ({ data }): Promise<PageSeo> => {
    try {
      const supabase = createClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
      );
      const { data: row } = await supabase
        .from("page_settings")
        .select("content, published")
        .eq("page_key", data.pageKey)
        .maybeSingle();
      // Only expose SEO for published pages on the public site
      if (!row || !(row as any).published) return {};
      const seo = (row?.content as any)?.seo;
      if (!seo || typeof seo !== "object") return {};
      return {
        title: typeof seo.title === "string" ? seo.title : undefined,
        description: typeof seo.description === "string" ? seo.description : undefined,
        ogImage: typeof seo.ogImage === "string" ? seo.ogImage : undefined,
        noindex: !!seo.noindex,
      };
    } catch {
      return {};
    }
  });
