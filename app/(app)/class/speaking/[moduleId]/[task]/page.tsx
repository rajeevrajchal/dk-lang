import { notFound } from "next/navigation";
import { SkillPractice } from "@/components/class/SkillPractice";

const SpeakingPracticePage = async ({
  params,
}: {
  params: Promise<{ moduleId: string; task: string }>;
}) => {
  const { moduleId, task } = await params;
  const moduleIdNum = Number(moduleId);
  if (!Number.isFinite(moduleIdNum)) notFound();

  return <SkillPractice category="SPEAKING" skill="speaking" moduleId={moduleIdNum} task={task} />;
};

export default SpeakingPracticePage;
