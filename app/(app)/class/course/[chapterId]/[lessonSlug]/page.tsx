import { redirect } from "next/navigation";

export default async function LessonRedirect({
  params,
}: {
  params: Promise<{ chapterId: string; lessonSlug: string }>;
}) {
  const { chapterId, lessonSlug } = await params;
  redirect(`/lessons/${chapterId}/${lessonSlug}`);
}
