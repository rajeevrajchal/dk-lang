import { notFound } from "next/navigation";
import { SkillTasks } from "@/components/class/SkillTasks";

export default async function WritingTasksPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  if (!Number.isFinite(moduleIdNum)) notFound();

  return <SkillTasks category="WRITING" skill="writing" moduleId={moduleIdNum} />;
}
