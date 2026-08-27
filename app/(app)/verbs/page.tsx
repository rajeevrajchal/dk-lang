import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { VerbBrowser } from "@/components/verbs/VerbBrowser";

// The 500 most common Danish verbs.
//
// A server component that renders the shell and hands the interactive list to
// a client component, which is the pattern the rest of the app uses: the page
// owns the session check, the island owns the state.

const VerbsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Linked to from the insights on /mistakes ("you have struggled with these 8
  // verbs"), so the filter arrives in the URL rather than being re-chosen.
  const { search, status } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Danish verbs</h1>
        <p className="mt-1 text-sm text-slate-600">
          The 500 most common verbs, with their forms, an example of each in use, and
          what you have done with them. Click any Danish word to see what it means.
        </p>
      </header>

      <VerbBrowser initialSearch={search ?? ""} initialStatus={status ?? "all"} />
    </div>
  );
};

export default VerbsPage;
