import { notFound } from "next/navigation";
import Link from "next/link";
import { getFarmBySlug } from "@/server/services/farm.service";
import { RunInterface } from "@/components/modules/run-interface";

interface RunPageProps {
  params: {
    slug: string;
  };
}

export default async function RunPage({ params }: RunPageProps) {
  // Awaiting params is required in next 15/app router sometimes, 
  // but let's access it properly or await if it's a promise based on config.
  // Next 15 (React 19) treats `params` as a promise in Server Components.
  const resolvedParams = await params;
  const farm = getFarmBySlug(resolvedParams.slug);

  if (!farm) {
    notFound();
  }

  return (
    <div className="min-h-full w-full min-w-0 flex-1 overflow-x-hidden bg-[#0c0c0e] text-zinc-100">
      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2"
            >
              <span>&larr;</span> Voltar para as Áreas
            </Link>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-amber-500/80 uppercase">
              {farm.area} · {farm.difficulty}
            </p>
            <h1 className="font-[family-name:var(--font-diablo)] text-4xl tracking-wide text-zinc-50 uppercase mt-1">
              Farmando: {farm.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {farm.note}. Matando {farm.monsters.join(", ")}.
            </p>
          </div>
        </header>

        {/* Client Component that handles the actual game loop logic */}
        <RunInterface farm={farm} />
      </main>
    </div>
  );
}
