import { createFileRoute } from "@tanstack/react-router";
import { GetInvolvedView } from "../ported/components/views/GetInvolvedView";
import { getPageSeo, type PageSeo } from "../lib/pageSeo.functions";
import { buildRouteHead } from "../lib/routeHead";

export const Route = createFileRoute("/get-involved")({
  loader: () => getPageSeo({ data: { pageKey: "get-involved" } }).catch((): PageSeo => ({})),
  head: ({ loaderData }) =>
    buildRouteHead({
      path: "/get-involved",
      defaultTitle: "Get Involved — Manyang Disability Foundation",
      defaultDescription:
        "Volunteer, partner, fundraise, or join an outreach mission with the foundation.",
      seo: loaderData,
    }),
  component: GetInvolvedView,
});
