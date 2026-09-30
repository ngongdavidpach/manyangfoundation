import { createFileRoute } from "@tanstack/react-router";
import { FundraiserPortalView } from "../ported/components/views/FundraiserPortalView";

export const Route = createFileRoute("/portal/fundraisers")({
  head: () => ({
    meta: [
      { title: "Fundraiser Sign-up — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Secure registration portal for Australian volunteer fundraisers to organise events supporting mobility-aid shipments.",
      },
      { name: "robots", content: "noindex" },
      {
        property: "og:title",
        content: "Fundraiser Sign-up — Manyang Disability Foundation",
      },
      {
        property: "og:url",
        content: "https://manyangdisabilityfoundation.org/portal/fundraisers",
      },
    ],
  }),
  component: FundraiserPortalView,
});
