import { notFound } from "next/navigation";
import { SkillTasks } from "@/components/class/SkillTasks";

const SpeakingTasksPage = async ({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) => {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  if (!Number.isFinite(moduleIdNum)) notFound();

  return <SkillTasks category="SPEAKING" skill="speaking" moduleId={moduleIdNum} />;
};

export default SpeakingTasksPage;
