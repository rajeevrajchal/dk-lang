import { notFound } from "next/navigation";
import { SkillTasks } from "@/components/class/SkillTasks";

export default async function SpeakingTasksPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  if (!Number.isFinite(moduleIdNum)) notFound();

  return <SkillTasks category="SPEAKING" skill="speaking" moduleId={moduleIdNum} />;
}
