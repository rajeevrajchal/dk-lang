import { notFound } from "next/navigation";
import { ExamReadingRunner } from "@/components/exam/ExamReadingRunner";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";

const MockReadingSectionPage = async ({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) => {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  const mod = MODULE_BY_ID.get(moduleIdNum);
  if (!mod || mod.isOralOnly) notFound();

  return <ExamReadingRunner moduleId={moduleIdNum} backHref={`/mock/${moduleIdNum}`} />;
};

export default MockReadingSectionPage;
