import { createFileRoute } from "@tanstack/react-router";
import { CoordinatorPortalView } from "../ported/components/views/CoordinatorPortalView";

export const Route = createFileRoute("/portal/coordinators")({
  head: () => ({
    meta: [
      { title: "Coordinator Registration — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Secure registration portal for local aid coordinators across East Africa to request mobility-aid support.",
      },
      { name: "robots", content: "noindex" },
      {
        property: "og:title",
        content: "Coordinator Registration — Manyang Disability Foundation",
      },
      {
        property: "og:url",
        content: "https://manyangdisabilityfoundation.org/portal/coordinators",
      },
    ],
  }),
  component: CoordinatorPortalView,
});
