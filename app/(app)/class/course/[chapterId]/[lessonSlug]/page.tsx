import { redirect } from "next/navigation";

const LessonRedirect = async ({
  params,
}: {
  params: Promise<{ chapterId: string; lessonSlug: string }>;
}) => {
  const { chapterId, lessonSlug } = await params;
  redirect(`/lessons/${chapterId}/${lessonSlug}`);
};

export default LessonRedirect;
