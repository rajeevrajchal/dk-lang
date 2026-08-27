import Link from "next/link";
import { MockTestRunner } from "@/components/exercises/MockTestRunner";
import { llmGenerationAvailable } from "@/lib/exercises/generator";

// The full mock test, freshly assembled.
//
// The one place a test is NOT numbered: "give me a test" is a different
// request from "let me sit Test 7 again", and it is the one a learner makes
// when they want to know whether they are ready rather than whether they have
// improved on a particular paper.
const FullMockPage = async () => {
  return (
    <div>
      <MockTestRunner generationEnabled={llmGenerationAvailable()} backHref="/mock" />
      <p className="mx-auto max-w-3xl px-6 pb-8 text-xs text-slate-400 sm:px-8">
        Looking for the same test twice?{" "}
        <Link href="/mock" className="underline">
          The numbered tests
        </Link>{" "}
        stay the same each time, so you can compare two sittings.
      </p>
    </div>
  );
};

export default FullMockPage;
