import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminDashboard } from "../ported/components/views/AdminDashboardView";
import { StaffLoginView } from "../ported/components/views/StaffLoginView";
import { useAuth } from "../ported/contexts/AuthContext";
import { verifyDashboardAccess } from "../lib/adminAccess.functions";

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function AccessDenied({ name }: { name?: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-red-200 p-8 sm:p-12 text-center max-w-md shadow-xs mx-auto">
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Hello {name || "friend"}, you are signed in, but your account does not have staff or
          admin clearance for this section.
        </p>
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Required clearance: <strong className="text-slate-700">admin or staff</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminRouteComponent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const verify = useServerFn(verifyDashboardAccess);

  // Server-verified dashboard gate: the client-side hasRole() cannot be
  // trusted for rendering. The server consults public.user_roles via
  // has_role() and reports whether this user is an admin or staff.
  const {
    data: gate,
    isLoading: isVerifying,
    isError,
  } = useQuery({
    queryKey: ["admin-access", user?.id],
    queryFn: () => verify(),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) return <LoadingPanel label="Restoring secure session..." />;
  if (!isAuthenticated) return <StaffLoginView />;
  if (isVerifying) return <LoadingPanel label="Verifying access..." />;
  if (isError || !gate?.role) return <AccessDenied name={user?.fullName?.split(" ")[0]} />;

  return <AdminDashboard role={gate.role} />;
}


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Manyang Disability Foundation" },
      {
        name: "description",
        content: "Admin dashboard for managing the Manyang Disability Foundation platform.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Console — Manyang Disability Foundation" },
      {
        property: "og:description",
        content: "Admin dashboard for managing the Manyang Disability Foundation platform.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://manyangdisabilityfoundation.org/admin" },
      { property: "og:image", content: "https://manyangdisabilityfoundation.org/images/logo.png" },
    ],
  }),
  component: AdminRouteComponent,
});
