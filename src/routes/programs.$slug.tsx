import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Heart } from "lucide-react";
import { getPublicProgram, type PublicProgram } from "../lib/publicContent.functions";
import { focusAreaIcon } from "../ported/lib/focusAreas";

const BASE = "https://manyangdisabilityfoundation.org";

export const Route = createFileRoute("/programs/$slug")({
  loader: async ({ params }) => {
    const program = await getPublicProgram({ data: { slug: params.slug } });
    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Program not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.program;
    const title = `${p.title} — Manyang Disability Foundation`;
    const description =
      (p.description || p.overview || p.title).slice(0, 155) ||
      "A program of the Manyang Disability Foundation.";
    const url = `${BASE}/programs/${params.slug}`;
    const meta: any[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (p.image && p.image.startsWith("https://")) {
      meta.push({ property: "og:image", content: p.image });
      meta.push({ name: "twitter:image", content: p.image });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: p.title,
            description,
            url,
            provider: {
              "@type": "NGO",
              name: "Manyang Disability Foundation",
              url: `${BASE}/`,
            },
            areaServed: "Australia",
          }),
        },
      ],
    };
  },
  notFoundComponent: ProgramNotFound,
  component: ProgramDetail,
});

function ProgramNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="text-3xl font-extrabold text-slate-900">Program not found</h1>
      <p className="text-slate-600">This program may have been renamed or removed.</p>
      <Link to="/programs" className="text-blue-600 font-semibold hover:text-blue-800">
        View all programs
      </Link>
    </div>
  );
}

function ProgramDetail() {
  const { program } = Route.useLoaderData() as { program: PublicProgram };
  const Icon = focusAreaIcon(program.icon);

  return (
    <article className="py-10 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Link
          to="/programs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" /> All programs
        </Link>

        <header className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Icon className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {program.title}
          </h1>
          {program.description && (
            <p className="text-lg text-slate-600 leading-relaxed">{program.description}</p>
          )}
        </header>

        {program.image && (
          <img
            src={program.image}
            alt={program.title}
            loading="lazy"
            className="w-full rounded-2xl border border-slate-200 object-cover max-h-96"
          />
        )}

        {program.overview && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">Overview</h2>
            {program.overview.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="text-slate-700 leading-relaxed whitespace-pre-line">
                {para}
              </p>
            ))}
          </section>
        )}

        {program.activities.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">What we do</h2>
            <ul className="space-y-2.5">
              {program.activities.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {program.benefits && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">Who it benefits</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{program.benefits}</p>
          </section>
        )}

        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Support this program</h2>
            <p className="text-sm text-slate-600 mt-1">
              Your gift or your time keeps this work going.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/donate"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              <Heart className="w-4 h-4" /> Donate
            </Link>
            <Link
              to="/get-involved"
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              Get involved <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
