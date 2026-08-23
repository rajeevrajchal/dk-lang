import { redirect } from "next/navigation";

// Mock tests moved into the Mock area. Old links land on the module's mock
// page, which offers the full test and the individual sections.
export default async function MockTestRedirect({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  redirect(`/mock/${moduleId}`);
}
