import { StashGridFrame } from "@/components/modules/stash-grid-frame";
import Link from "next/link";

export const metadata = {
  title: "Stash",
};

export default function StashPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-amber-500 hover:underline">&larr; Back to Farms</Link>
      </div>
      <StashGridFrame />
    </main>
  );
}
