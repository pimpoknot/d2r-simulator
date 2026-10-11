import { notFound } from "next/navigation";
import { getFarmBySlug } from "@/server/services/farm.service";
import { RunInterface } from "@/components/modules/run-interface";
import { AppHeader } from "@/components/modules/app-header";
import { AppFooter } from "@/components/modules/app-footer";
import { TelemetryStrip } from "@/components/modules/telemetry-strip";

interface RunPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const resolvedParams = await params;
  const farm = getFarmBySlug(resolvedParams.slug);

  if (!farm) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <TelemetryStrip />
      <RunInterface farm={farm} />
      <AppFooter />
    </div>
  );
}
