import { redirect } from "next/navigation";
import { TaskPage } from "@/components/tasks/TaskPage";

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ practiceType: string; taskNumber: string }>;
  searchParams: Promise<{ again?: string; review?: string }>;
}) => {
  const { practiceType, taskNumber } = await params;
  // An old /class/writing/<moduleId>/<taskType> URL.
  if (/^\d+$/.test(practiceType)) redirect("/class/writing");

  return (
    <TaskPage
      category="WRITING"
      practiceTypeSlug={practiceType}
      taskNumberParam={taskNumber}
      searchParams={searchParams}
    />
  );
};

export default Page;
