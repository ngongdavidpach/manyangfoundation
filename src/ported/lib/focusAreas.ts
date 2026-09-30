import {
  Accessibility,
  Scale,
  BookOpen,
  HeartPulse,
  Trophy,
  Handshake,
  Coins,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface FocusArea {
  title: string;
  description?: string;
  icon?: string;
  slug?: string;
  overview?: string;
  activities?: string[];
  benefits?: string;
  image?: string;
}

export const FOCUS_AREA_ICONS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "Scale", label: "Advocacy / Rights", Icon: Scale },
  { id: "BookOpen", label: "Culture & Language", Icon: BookOpen },
  { id: "HeartPulse", label: "Health", Icon: HeartPulse },
  { id: "Trophy", label: "Sport & Talent", Icon: Trophy },
  { id: "Handshake", label: "Liaison / Partnership", Icon: Handshake },
  { id: "Coins", label: "Fundraising", Icon: Coins },
  { id: "Accessibility", label: "Disability support", Icon: Accessibility },
  { id: "Sparkles", label: "General", Icon: Sparkles },
];

export function focusAreaIcon(id?: string): LucideIcon {
  return FOCUS_AREA_ICONS.find((i) => i.id === id)?.Icon ?? Sparkles;
}

export function slugifyFocusArea(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 6)
    .join("-");
}

export function normalizeFocusAreas(value: unknown): FocusArea[] {
  if (!Array.isArray(value)) return [];
  const used = new Set<string>();
  return (value as FocusArea[])
    .filter((a) => a && typeof a.title === "string" && a.title.trim())
    .map((a) => {
      let slug =
        typeof a.slug === "string" && a.slug.trim()
          ? slugifyFocusArea(a.slug)
          : slugifyFocusArea(a.title);
      if (!slug) slug = "program";
      let candidate = slug;
      let n = 2;
      while (used.has(candidate)) candidate = `${slug}-${n++}`;
      used.add(candidate);
      return {
        title: a.title.trim(),
        description: typeof a.description === "string" ? a.description : "",
        icon: typeof a.icon === "string" ? a.icon : "Sparkles",
        slug: candidate,
        overview: typeof a.overview === "string" ? a.overview : "",
        activities: Array.isArray(a.activities)
          ? a.activities.filter((x): x is string => typeof x === "string" && !!x.trim())
          : [],
        benefits: typeof a.benefits === "string" ? a.benefits : "",
        image: typeof a.image === "string" ? a.image : "",
      };
    });
}
