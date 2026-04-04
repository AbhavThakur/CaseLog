import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import { Sidebar, MobileNav } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { OfflineBanner } from "@/components/OfflineBanner";
import { InstallBanner } from "@/components/InstallBanner";
import { Onboarding } from "@/components/Onboarding";

export function AppLayout() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !!user && !localStorage.getItem("onboarding-complete"),
  );

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboarding-complete", "1");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <OfflineBanner />
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <InstallBanner />
      <Toaster />
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
    </div>
  );
}
