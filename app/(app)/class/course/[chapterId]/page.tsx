import { redirect } from "next/navigation";

const ChapterRedirect = async ({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) => {
  const { chapterId } = await params;
  redirect(`/lessons/${chapterId}`);
};

export default ChapterRedirect;
