import { notFound } from "next/navigation";
import { SkillPractice } from "@/components/class/SkillPractice";

const WritingPracticePage = async ({
  params,
}: {
  params: Promise<{ moduleId: string; task: string }>;
}) => {
  const { moduleId, task } = await params;
  const moduleIdNum = Number(moduleId);
  if (!Number.isFinite(moduleIdNum)) notFound();

  return <SkillPractice category="WRITING" skill="writing" moduleId={moduleIdNum} task={task} />;
};

export default WritingPracticePage;
