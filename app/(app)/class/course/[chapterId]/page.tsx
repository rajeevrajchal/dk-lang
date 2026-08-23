import { redirect } from "next/navigation";

export default async function ChapterRedirect({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  redirect(`/lessons/${chapterId}`);
}
