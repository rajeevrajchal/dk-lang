import { notFound } from "next/navigation";
import { MockTestRunner } from "@/components/exercises/MockTestRunner";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";

export default async function MockTestPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  const mod = MODULE_BY_ID.get(moduleIdNum);
  if (!mod || mod.isOralOnly) notFound();

  return (
    <MockTestRunner moduleId={moduleIdNum} generationEnabled={llmGenerationAvailable()} />
  );
}
