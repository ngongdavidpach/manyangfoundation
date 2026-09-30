import { createFileRoute } from "@tanstack/react-router";
import { GalleryView } from "../ported/components/views/GalleryView";
import { getPageSeo, type PageSeo } from "../lib/pageSeo.functions";
import { buildRouteHead } from "../lib/routeHead";

export const Route = createFileRoute("/gallery")({
  loader: () => getPageSeo({ data: { pageKey: "gallery" } }).catch((): PageSeo => ({})),
  head: ({ loaderData }) =>
    buildRouteHead({
      path: "/gallery",
      defaultTitle: "Gallery — Manyang Disability Foundation",
      defaultDescription:
        "Photos from outreach missions, wheelchair distributions, and community events.",
      seo: loaderData,
    }),
  component: GalleryView,
});
