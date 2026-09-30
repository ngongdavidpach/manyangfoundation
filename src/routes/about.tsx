import { createFileRoute } from "@tanstack/react-router";
import { AboutView } from "../ported/components/views/AboutView";
import {
  getPublicAboutFaqs,
  getAboutStructuredData,
} from "../lib/publicContent.functions";

export const Route = createFileRoute("/about")({
  loader: async () => ({
    faqs: await getPublicAboutFaqs(),
    structured: await getAboutStructuredData(),
  }),
  head: ({ loaderData }) => {
    const faqs = loaderData?.faqs ?? [];
    const sd = loaderData?.structured ?? null;
    const orgName = sd?.orgName?.trim() || "Manyang Disability Foundation";
    const orgUrl = sd?.orgUrl?.trim() || "https://manyangdisabilityfoundation.org/";
    const orgLogo =
      sd?.orgLogo?.trim() || "https://manyangdisabilityfoundation.org/images/logo.png";
    const orgDescription =
      sd?.orgDescription?.trim() ||
      "Manyang Disability Foundation supports persons with disabilities through mobility aids, healthcare access, inclusive education, and sustainable livelihoods.";
    const sameAs = (sd?.orgSameAs || "https://manyangdisabilityfoundation.lovable.app")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const scripts: Array<{ type: string; children: string }> = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: orgName,
          url: orgUrl,
          logo: orgLogo,
          description: orgDescription,
          ...(sameAs.length ? { sameAs } : {}),
        }),
      },
    ];
    if (faqs.length > 0) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      });
    }
    return {
      meta: [
        { title: "About — Manyang Disability Foundation" },
        {
          name: "description",
          content:
            "Our mission, governance, and approach to supporting persons with disabilities.",
        },
        { property: "og:title", content: "About — Manyang Disability Foundation" },
        {
          property: "og:description",
          content:
            "Our mission, governance, and approach to supporting persons with disabilities.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://manyangdisabilityfoundation.org/about" },
        {
          property: "og:image",
          content: "https://manyangdisabilityfoundation.org/images/logo.png",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "About — Manyang Disability Foundation" },
        {
          name: "twitter:description",
          content:
            "Our mission, governance, and approach to supporting persons with disabilities.",
        },
      ],
      links: [{ rel: "canonical", href: "https://manyangdisabilityfoundation.org/about" }],
      scripts,
    };
  },
  component: AboutView,
});
