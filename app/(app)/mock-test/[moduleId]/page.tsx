import { redirect } from "next/navigation";

// Mock tests moved into the Mock area, which no longer asks for a module —
// it comes from the learner's profile. Old links land on Mock itself.
const MockTestRedirect = async () => {
  redirect("/mock");
};

export default MockTestRedirect;
