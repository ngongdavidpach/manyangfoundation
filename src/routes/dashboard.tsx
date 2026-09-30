import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "../ported/components/views/DashboardView";
import { ProtectedRoute } from "../ported/components/ProtectedRoute";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Manyang Disability Foundation" },
      {
        name: "description",
        content: "Your personal dashboard for managing mobility aid requests and profile.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My Dashboard — Manyang Disability Foundation" },
      {
        property: "og:description",
        content: "Your personal dashboard for managing mobility aid requests and profile.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://manyangdisabilityfoundation.org/dashboard" },
      { property: "og:image", content: "https://manyangdisabilityfoundation.org/images/logo.png" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  ),
});
