import { useEffect, useRef, useState } from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  // Track offline→online transitions via event listeners
  useEffect(() => {
    const handleOffline = () => {
      wasOfflineRef.current = true;
    };
    const handleOnline = () => {
      if (wasOfflineRef.current) {
        setShowReconnected(true);
        wasOfflineRef.current = false;
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div
        role="alert"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 text-sm font-medium shadow-lg"
      >
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>
          You are offline. Changes will sync when connection is restored.
        </span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div
        role="status"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-lg animate-in fade-in duration-300"
      >
        <span>Back online — syncing changes.</span>
      </div>
    );
  }

  return null;
}
