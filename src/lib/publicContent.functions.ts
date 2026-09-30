import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  category: string | null;
  rsvp_url: string | null;
};

function server() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listPublicEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicEvent[]> => {
    try {
      const client = server();
      const { data } = await client
        .from("events")
        .select(
          "id, slug, title, description, cover_image, starts_at, ends_at, location, category, rsvp_url",
        )
        .eq("status", "published")
        .order("starts_at", { ascending: true });
      return (data as PublicEvent[]) ?? [];
    } catch {
      return [];
    }
  },
);

export const getPublicEvent = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }): Promise<PublicEvent | null> => {
    try {
      const client = server();
      const { data: row } = await client
        .from("events")
        .select(
          "id, slug, title, description, cover_image, starts_at, ends_at, location, category, rsvp_url",
        )
        .eq("slug", data.slug)
        .eq("status", "published")
        .maybeSingle();
      return (row as PublicEvent | null) ?? null;
    } catch {
      return null;
    }
  });

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const client = server();
      const { data } = await client
        .from("news_articles")
        .select("slug, title, excerpt, cover_image, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(24);
      return (data ?? []) as Array<{
        slug: string;
        title: string;
        excerpt: string | null;
        cover_image: string | null;
        published_at: string | null;
      }>;
    } catch {
      return [];
    }
  },
);

export const getPublishedArticle = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const client = server();
      const { data: row } = await client
        .from("news_articles")
        .select("slug, title, excerpt, body_md, cover_image, published_at")
        .eq("slug", data.slug)
        .eq("status", "published")
        .maybeSingle();
      return (row as {
        slug: string;
        title: string;
        excerpt: string | null;
        body_md: string | null;
        cover_image: string | null;
        published_at: string | null;
      } | null) ?? null;
    } catch {
      return null;
    }
  });

export type PublicFaq = { question: string; answer: string; category?: string };

export type AboutStructuredData = {
  orgName?: string;
  orgUrl?: string;
  orgLogo?: string;
  orgDescription?: string;
  orgSameAs?: string;
};

export type ProgramsStructuredData = {
  name?: string;
  description?: string;
  url?: string;
  topics?: string;
};

export const getPublicAboutFaqs = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicFaq[]> => {
    try {
      const client = server();
      const { data: row } = await client
        .from("page_settings")
        .select("content, published")
        .eq("page_key", "about")
        .maybeSingle();
      if (!row || !(row as { published?: boolean }).published) return [];
      const content = (row as { content?: { faqs?: unknown } }).content;
      const faqs = Array.isArray(content?.faqs) ? content!.faqs : [];
      return (faqs as PublicFaq[])
        .filter(
          (f) =>
            f &&
            typeof f.question === "string" &&
            typeof f.answer === "string" &&
            f.question.trim() &&
            f.answer.trim(),
        )
        .map((f) => ({ question: f.question, answer: f.answer }));
    } catch {
      return [];
    }
  },
);

async function readPageStructured<T>(pageKey: string): Promise<T | null> {
  try {
    const client = server();
    const { data: row } = await client
      .from("page_settings")
      .select("content, published")
      .eq("page_key", pageKey)
      .maybeSingle();
    if (!row || !(row as { published?: boolean }).published) return null;
    const content = (row as { content?: { structuredData?: T } }).content;
    return (content?.structuredData ?? null) as T | null;
  } catch {
    return null;
  }
}

export const getAboutStructuredData = createServerFn({ method: "GET" }).handler(
  async (): Promise<AboutStructuredData | null> => readPageStructured<AboutStructuredData>("about"),
);

export const getProgramsStructuredData = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProgramsStructuredData | null> =>
    readPageStructured<ProgramsStructuredData>("programs"),
);

export type PublicProgram = {
  title: string;
  slug: string;
  description: string;
  icon: string;
  overview: string;
  activities: string[];
  benefits: string;
  image: string;
};

async function readProgramList(): Promise<PublicProgram[]> {
  try {
    const client = server();
    const { data: row } = await client
      .from("page_settings")
      .select("content, published")
      .eq("page_key", "programs")
      .maybeSingle();
    if (!row || !(row as { published?: boolean }).published) return [];
    const content = (row as { content?: { focusAreas?: unknown } }).content;
    const { normalizeFocusAreas } = await import("@/ported/lib/focusAreas");
    return normalizeFocusAreas(content?.focusAreas).map((a) => ({
      title: a.title,
      slug: a.slug || "",
      description: a.description || "",
      icon: a.icon || "Sparkles",
      overview: a.overview || "",
      activities: a.activities || [],
      benefits: a.benefits || "",
      image: a.image || "",
    }));
  } catch {
    return [];
  }
}

export const listPublicPrograms = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicProgram[]> => readProgramList(),
);

export const getPublicProgram = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }): Promise<PublicProgram | null> => {
    const list = await readProgramList();
    return list.find((p) => p.slug === data.slug) ?? null;
  });
