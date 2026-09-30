import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "../ported/components/views/HomeView";
import { getPageSeo, type PageSeo } from "../lib/pageSeo.functions";

const DEFAULTS = {
  title: "Manyang Disability Foundation — Mobility, Health & Education",
  description:
    "Uplifting persons with disabilities through tailored mobility aids, healthcare access, inclusive education, and sustainable livelihoods.",
};

export const Route = createFileRoute("/")({
  loader: () => getPageSeo({ data: { pageKey: "home" } }).catch((): PageSeo => ({})),
  head: ({ loaderData }) => {
    const seo = loaderData ?? {};
    const title = seo.title || DEFAULTS.title;
    const description = seo.description || DEFAULTS.description;
    const meta: any[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://manyangdisabilityfoundation.org/" },
    ];
    if (seo.ogImage) {
      meta.push({ property: "og:image", content: seo.ogImage });
      meta.push({ name: "twitter:image", content: seo.ogImage });
    }
    if (seo.noindex) meta.push({ name: "robots", content: "noindex" });
    return {
      meta,
      links: [{ rel: "canonical", href: "https://manyangdisabilityfoundation.org/" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Manyang Disability Foundation",
            url: "https://manyangdisabilityfoundation.org/",
            logo: "https://manyangdisabilityfoundation.org/images/logo.png",
          }),
        },
      ],
    };
  },
  component: HomeView,
});
