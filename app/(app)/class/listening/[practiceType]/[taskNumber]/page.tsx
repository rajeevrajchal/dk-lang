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
  // An old /class/listening/<moduleId>/<taskType> URL.
  if (/^\d+$/.test(practiceType)) redirect("/class/listening");

  return (
    <TaskPage
      category="LISTENING"
      practiceTypeSlug={practiceType}
      taskNumberParam={taskNumber}
      searchParams={searchParams}
    />
  );
};

export default Page;
