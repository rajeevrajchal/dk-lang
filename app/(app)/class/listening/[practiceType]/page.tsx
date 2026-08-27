import { redirect } from "next/navigation";
import { TaskListPage } from "@/components/tasks/TaskListPage";

// The task list for one practice type.
//
// A numeric segment here is an old module URL — /class/listening/2 used to mean
// "Modul 2". The module now comes from the learner's profile, so those links
// are sent to the category instead of 404ing.

const Page = async ({ params }: { params: Promise<{ practiceType: string }> }) => {
  const { practiceType } = await params;
  if (/^\d+$/.test(practiceType)) redirect("/class/listening");

  return <TaskListPage category="LISTENING" practiceTypeSlug={practiceType} />;
};

export default Page;
