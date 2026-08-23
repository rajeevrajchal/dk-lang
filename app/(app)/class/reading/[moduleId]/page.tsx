import { notFound } from "next/navigation";
import { SkillTasks } from "@/components/class/SkillTasks";

const ReadingTasksPage = async ({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) => {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  if (!Number.isFinite(moduleIdNum)) notFound();

  return <SkillTasks category="READING" skill="reading" moduleId={moduleIdNum} />;
};

export default ReadingTasksPage;
