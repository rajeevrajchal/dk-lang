import { notFound, redirect } from "next/navigation";
import { EXERCISE_CATEGORIES } from "@/lib/exercises/constants";
import type { ExerciseCategory } from "@/types";

// Opgave practice moved under Class, where it sits beside the other two
// skills instead of being a separate corner of the app. Old links still work.
const OpgaverRedirect = async ({
  params,
}: {
  params: Promise<{ moduleId: string; category: string }>;
}) => {
  const { moduleId, category } = await params;
  const upper = category.toUpperCase() as ExerciseCategory;

  if (!Number.isFinite(Number(moduleId)) || !EXERCISE_CATEGORIES.includes(upper)) {
    notFound();
  }

  // Listening has no practice route of its own — it has no content — so it
  // lands on the Class overview, which says as much.
  if (upper === "LISTENING") redirect("/class");

  redirect(`/class/${category.toLowerCase()}/${moduleId}/any`);
};

export default OpgaverRedirect;
