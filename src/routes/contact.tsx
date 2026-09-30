import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "../ported/components/views/ContactView";
import { getTurnstileSiteKey } from "../lib/contact.functions";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    try {
      const { siteKey } = await getTurnstileSiteKey();
      return { siteKey };
    } catch {
      return { siteKey: null as string | null };
    }
  },
  head: () => ({
    meta: [
      { title: "Contact & Partner Inquiries — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Reach the Manyang Disability Foundation team for partnerships, CSR sponsorships, media, and general inquiries.",
      },
      { property: "og:title", content: "Contact — Manyang Disability Foundation" },
      {
        property: "og:description",
        content: "Partnerships, CSR sponsorships, and general enquiries.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://manyangdisabilityfoundation.org/contact" },
    ],
    links: [{ rel: "canonical", href: "https://manyangdisabilityfoundation.org/contact" }],
  }),
  component: ContactRoute,
});

function ContactRoute() {
  const { siteKey } = Route.useLoaderData();
  return <ContactView siteKey={siteKey} />;
}
