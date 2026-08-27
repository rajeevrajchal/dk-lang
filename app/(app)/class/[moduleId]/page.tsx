import { redirect } from "next/navigation";

// The per-module hub, retired.
//
// This page existed to answer "show me everything for Modul 2". That question
// is no longer one the learner asks: the module comes from their profile, and
// Class is organised by what they want to practise rather than by which module
// they are in. Links that still point here — from older exercise runners and
// from anything a learner bookmarked — land on Class instead of 404ing.
//
// The route itself stays because /class/[moduleId]/theory/[slug] is still a
// real destination: a theory lesson is genuinely module-scoped, and the Explain
// panel links straight to one.
const Page = async () => {
  redirect("/class");
};

export default Page;
