import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function InstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500 lg:hidden">
      <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl p-4">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 p-1 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
            <Download className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm">Install CaseLog</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Add to home screen for quick access & offline use
            </p>
            <Button
              size="sm"
              className="mt-2 rounded-xl h-8 text-xs w-full"
              onClick={install}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Install App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
