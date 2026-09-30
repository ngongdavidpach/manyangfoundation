import { createFileRoute } from "@tanstack/react-router";
import { CsrSponsorshipView } from "../ported/components/views/CsrSponsorshipView";

export const Route = createFileRoute("/csr-sponsorship")({
  head: () => ({
    meta: [
      { title: "CSR Sponsorship — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Corporate Social Responsibility partnership tiers and downloadable prospectus for sponsoring mobility-aid shipments to East Africa.",
      },
      { property: "og:title", content: "CSR Sponsorship — Manyang Disability Foundation" },
      {
        property: "og:description",
        content:
          "Sponsor large equipment shipments. Download the prospectus and sponsorship tier list.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://manyangdisabilityfoundation.org/csr-sponsorship",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://manyangdisabilityfoundation.org/csr-sponsorship",
      },
    ],
  }),
  component: CsrSponsorshipView,
});
