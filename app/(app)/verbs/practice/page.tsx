import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { VerbPractice } from "@/components/verbs/VerbPractice";

// Verb practice.
//
// `?verbs=a,b,c` practises a specific set, which is how "practise these
// mistakes again" on /mistakes gets here — the review screen does not need a
// practice engine of its own.

const VerbPracticePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ verbs?: string }>;
}) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { verbs } = await searchParams;
  const verbIds = verbs
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 30);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
      <Link href="/verbs" className="text-sm text-slate-500 hover:underline">
        ← All verbs
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Practise verbs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Recognising a verb and producing one are different skills, so a round mixes
          both — plus the forms the modultest actually asks for.
        </p>
      </header>

      <VerbPractice verbIds={verbIds?.length ? verbIds : undefined} />
    </div>
  );
};

export default VerbPracticePage;
