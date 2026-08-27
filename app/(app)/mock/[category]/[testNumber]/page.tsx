import { notFound } from "next/navigation";
import { MockTestRunner } from "@/components/exercises/MockTestRunner";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import { CATEGORY_BY_SLUG, TASKS_PER_TYPE } from "@/lib/tasks/catalogue";

// One numbered section test.
//
// Test 7 is Task 7 of each part of that section, taken from the same ladders
// Class practises against — so a mock test is not a private copy of the task
// architecture, it is a timed run through it with the feedback withheld until
// the end.
const Page = async ({
  params,
}: {
  params: Promise<{ category: string; testNumber: string }>;
}) => {
  const { category: slug, testNumber } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  const n = Number(testNumber);
  if (!category || !Number.isInteger(n) || n < 1 || n > TASKS_PER_TYPE) notFound();

  return (
    <MockTestRunner
      generationEnabled={llmGenerationAvailable()}
      testNumber={n}
      category={category.key}
      title={`${category.label} — Test ${n}`}
      backHref="/mock"
    />
  );
};

export default Page;
