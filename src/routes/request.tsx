import { createFileRoute } from "@tanstack/react-router";
import { RequestView } from "../ported/components/views/RequestView";

export const Route = createFileRoute("/request")({
  head: () => ({
    meta: [
      { title: "Request Mobility Aid — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Submit a request for mobility aid support from the Manyang Disability Foundation.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Request Mobility Aid — Manyang Disability Foundation" },
      {
        property: "og:description",
        content:
          "Submit a request for mobility aid support from the Manyang Disability Foundation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://manyangdisabilityfoundation.org/request" },
      { property: "og:image", content: "https://manyangdisabilityfoundation.org/images/logo.png" },
    ],
  }),
  component: RequestView,
});
