import { createFileRoute } from "@tanstack/react-router";
import { DonateView } from "../ported/components/views/DonateView";
import { getPageSeo, type PageSeo } from "../lib/pageSeo.functions";
import { buildRouteHead } from "../lib/routeHead";

export const Route = createFileRoute("/donate")({
  loader: () => getPageSeo({ data: { pageKey: "donate" } }).catch((): PageSeo => ({})),
  head: ({ loaderData }) =>
    buildRouteHead({
      path: "/donate",
      defaultTitle: "Donate — Manyang Disability Foundation",
      defaultDescription:
        "Fund custom wheelchairs, rehabilitation surgeries, and inclusive classroom tools.",
      seo: loaderData,
    }),
  component: DonateView,
});
