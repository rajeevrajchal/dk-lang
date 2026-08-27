import { notFound, redirect } from "next/navigation";
import { CATEGORY_BY_SLUG } from "@/lib/tasks/catalogue";

// Opgave practice moved under Class, which is now organised by category and
// takes the module from the learner's profile. Old links keep working: the
// module in the URL is dropped, because it is no longer the learner's to pick.
const OpgaverRedirect = async ({
  params,
}: {
  params: Promise<{ moduleId: string; category: string }>;
}) => {
  const { category } = await params;
  const definition = CATEGORY_BY_SLUG.get(category.toLowerCase());
  if (!definition) notFound();

  redirect(`/class/${definition.slug}`);
};

export default OpgaverRedirect;
