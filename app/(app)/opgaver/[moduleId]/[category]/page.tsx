import { notFound } from "next/navigation";
import { ExerciseRunner } from "@/components/exercises/ExerciseRunner";
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/exercises/types";

export default async function OpgaverPage({
  params,
}: {
  params: Promise<{ moduleId: string; category: string }>;
}) {
  const { moduleId, category } = await params;
  const moduleIdNum = Number(moduleId);
  const upper = category.toUpperCase() as ExerciseCategory;

  if (!Number.isFinite(moduleIdNum) || !EXERCISE_CATEGORIES.includes(upper)) {
    notFound();
  }

  return <ExerciseRunner moduleId={moduleIdNum} category={upper} />;
}
