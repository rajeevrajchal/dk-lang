import { auth } from "@/lib/auth";
import { getUserLevel } from "@/lib/level";
import { getServerDictionary } from "@/lib/i18n/server";
import { OnboardingForm } from "@/components/profile/OnboardingForm";

// One of exactly two places the app asks for the learner's level (the other is
// Settings → official test results). See docs/product-architecture.md §8.
export default async function OnboardingPage() {
  const session = await auth();
  const dict = await getServerDictionary();
  const level = await getUserLevel(session!.user.id);

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">{dict.onboarding.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{dict.onboarding.subtitle}</p>
      </div>

      <OnboardingForm
        initialEducation={level.education}
        initialModule={level.currentModule}
      />
    </div>
  );
}
