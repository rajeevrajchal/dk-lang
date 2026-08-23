import { notFound } from "next/navigation";
import { ExamReadingRunner } from "@/components/exam/ExamReadingRunner";

// The timed reading test now lives under Mock. This route stays so older links
// keep working, and renders the same runner rather than redirecting mid-test.
const ExamReadingPage = async ({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) => {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  if (!Number.isFinite(moduleIdNum)) notFound();

  return <ExamReadingRunner moduleId={moduleIdNum} backHref={`/mock/${moduleIdNum}`} />;
};

export default ExamReadingPage;
