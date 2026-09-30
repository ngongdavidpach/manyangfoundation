import { createFileRoute } from "@tanstack/react-router";
import { ProgramsView } from "../ported/components/views/ProgramsView";
import { getPageSeo, type PageSeo } from "../lib/pageSeo.functions";
import { getProgramsStructuredData } from "../lib/publicContent.functions";
import { buildRouteHead } from "../lib/routeHead";

export const Route = createFileRoute("/programs")({
  loader: async () => ({
    seo: await getPageSeo({ data: { pageKey: "programs" } }).catch((): PageSeo => ({})),
    structured: await getProgramsStructuredData(),
  }),
  head: ({ loaderData }) => {
    const base = buildRouteHead({
      path: "/programs",
      defaultTitle: "Programs — Manyang Disability Foundation",
      defaultDescription:
        "Mobility aids, surgical assistance, inclusive education, and livelihood micro-grants.",
      seo: loaderData?.seo,
    });
    const sd = loaderData?.structured ?? null;
    const name = sd?.name?.trim() || "Programs — Manyang Disability Foundation";
    const description =
      sd?.description?.trim() ||
      "Mobility aids, surgical assistance, inclusive education, and livelihood micro-grants programs run by the Manyang Disability Foundation.";
    const url = sd?.url?.trim() || "https://manyangdisabilityfoundation.org/programs";
    const topicList = (
      sd?.topics ||
      "Mobility aids, Surgical assistance, Inclusive education, Livelihood micro-grants"
    )
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name,
            description,
            url,
            isPartOf: {
              "@type": "WebSite",
              name: "Manyang Disability Foundation",
              url: "https://manyangdisabilityfoundation.org/",
            },
            about: topicList.map((t) => ({ "@type": "Thing", name: t })),
          }),
        },
      ],
    };
  },
  component: ProgramsView,
});
