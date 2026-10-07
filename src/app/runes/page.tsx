import type { Metadata } from "next";
import Link from "next/link";

import { RuneTable } from "@/components/modules/rune-table";
import { listRunes } from "@/server/repositories/rune.repo";

export const metadata: Metadata = {
  title: "Runas",
  description:
    "Lista das runas de Diablo II com os bônus em arma, elmo, armadura e escudo.",
};

export default async function RunesPage() {
  let runes: Awaited<ReturnType<typeof listRunes>> = [];
  let failed = false;

  try {
    runes = await listRunes();
  } catch (cause) {
    failed = true;
    console.error("Failed to list runes", cause);
  }

  return (
    <div className="min-h-full w-full min-w-0 flex-1 overflow-x-hidden bg-[#0c0c0e] text-zinc-100">
      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-fit text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
          >
            Início
          </Link>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-sky-400 uppercase">
              Diablo II
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Lista de runas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Bônus de cada runa encaixada em arma, elmo, armadura ou escudo.
              Quando o bônus é o mesmo em slots vizinhos, a célula aparece
              unida.
            </p>
          </div>
        </header>

        {failed ? (
          <p
            role="alert"
            className="rounded-md border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            Não foi possível carregar as runas. Confira se o Postgres está no
            ar.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-500">
              {runes.length} {runes.length === 1 ? "runa" : "runas"}
            </p>
            <RuneTable runes={runes} />
          </>
        )}
      </main>
    </div>
  );
}
