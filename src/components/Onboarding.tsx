import { useState, useCallback } from "react";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OnboardingCasesIllustration,
  OnboardingTimelineIllustration,
  OnboardingCameraIllustration,
  OnboardingBellIllustration,
  OnboardingShareIllustration,
} from "@/components/illustrations";

const STEPS = [
  {
    illustration: OnboardingCasesIllustration,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Track Patient Cases",
    description:
      "Create detailed patient records with demographics, diagnosis, vitals, investigations, and clinical history — all in one place.",
  },
  {
    illustration: OnboardingTimelineIllustration,
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    title: "Timeline & Vitals",
    description:
      "Build a chronological timeline of observations, medications, procedures, and lab results. Track vitals with interactive body-map visualization.",
  },
  {
    illustration: OnboardingCameraIllustration,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    title: "Photos & Documents",
    description:
      "Attach images, X-rays, CT scans, and reports directly to timeline entries. Quick photo capture with your phone camera.",
  },
  {
    illustration: OnboardingBellIllustration,
    color: "text-rose-500",
    bg: "bg-rose-100 dark:bg-rose-900/30",
    title: "Reminders & Follow-ups",
    description:
      "Set reminders for medication, lab reviews, or follow-up visits. Never miss a critical patient action.",
  },
  {
    illustration: OnboardingShareIllustration,
    color: "text-violet-500",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    title: "Share & Export",
    description:
      "Share case summaries via secure links or export complete case PDFs for referrals, case discussions, or medical records.",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step]!;
  const Illustration = current.illustration;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, onComplete]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Visual area */}
        <div className="relative bg-gradient-to-br from-[hsl(var(--primary))]/5 to-[hsl(var(--primary))]/15 px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Skip button */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            Skip
          </button>

          <div
            className={`w-20 h-20 rounded-2xl ${current.bg} flex items-center justify-center mb-5 transition-all duration-300`}
          >
            <Illustration className="w-14 h-14" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">{current.title}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed max-w-xs">
            {current.description}
          </p>
        </div>

        {/* Progress dots + navigation */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-[hsl(var(--primary))]"
                    : i < step
                      ? "w-1.5 bg-[hsl(var(--primary))]/50"
                      : "w-1.5 bg-[hsl(var(--muted))]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" className="rounded-xl" onClick={handleNext}>
              {isLast ? (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
