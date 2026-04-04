import { useRegisterSW } from "virtual:pwa-register/react";

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => registration.update(), 60_000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-sm w-full rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 shadow-2xl text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Update Available</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            A new version of CaseLog is ready. Reload to get the latest
            features.
          </p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-2.5 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Reload Now
        </button>
      </div>
    </div>
  );
}
