import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePageSettings<T = any>(pageKey: string, fallback: T) {
  const [content, setContent] = useState<T>(fallback);
  const [published, setPublishedState] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("page_settings")
      .select("content, published")
      .eq("page_key", pageKey)
      .maybeSingle();
    if (data?.content) setContent({ ...fallback, ...(data.content as any) });
    setPublishedState(!!(data as any)?.published);
    setLoading(false);
  }, [pageKey]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (next: Partial<T>) => {
      const merged = { ...content, ...next } as T;
      setContent(merged);
      const { error } = await supabase
        .from("page_settings")
        .upsert(
          { page_key: pageKey, content: merged as any, published } as any,
          { onConflict: "page_key" },
        );
      if (error) throw error;
    },
    [content, pageKey, published],
  );

  const setPublished = useCallback(
    async (next: boolean) => {
      setPublishedState(next);
      const { error } = await supabase
        .from("page_settings")
        .upsert(
          { page_key: pageKey, content: content as any, published: next } as any,
          { onConflict: "page_key" },
        );
      if (error) throw error;
    },
    [content, pageKey],
  );

  return { content, published, loading, save, setPublished, reload: load };
}
