import { notFound } from "next/navigation";
import { MockTestRunner } from "@/components/exercises/MockTestRunner";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";

// The full mock test. Same runner, same API, same scoring as before the
// restructure — only the URL and the way in changed.
const FullMockPage = async ({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) => {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  const mod = MODULE_BY_ID.get(moduleIdNum);
  if (!mod || mod.isOralOnly) notFound();

  return (
    <MockTestRunner
      moduleId={moduleIdNum}
      generationEnabled={llmGenerationAvailable()}
      backHref={`/mock/${moduleIdNum}`}
    />
  );
};

export default FullMockPage;
