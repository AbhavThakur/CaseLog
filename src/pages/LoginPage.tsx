import { useNavigate, Navigate } from "react-router";
import { ClipboardList, Shield, Wifi, Smartphone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInAsDemo } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border-2 border-[hsl(var(--primary))]/20 animate-ping" />
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      setError(message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await signInAsDemo();
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Demo sign-in failed";
      setError(message);
    } finally {
      setDemoLoading(false);
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Patient Timeline",
      desc: "Track every observation, treatment & procedure",
    },
    {
      icon: Smartphone,
      title: "Works Offline",
      desc: "PWA with offline-first architecture",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "End-to-end encrypted patient data",
    },
    {
      icon: Wifi,
      title: "Real-time Sync",
      desc: "Instant updates across all devices",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[hsl(var(--background))]">
      {/* ── Mobile Hero Header (visible < lg) ── */}
      <div className="lg:hidden relative overflow-hidden bg-med-night px-6 pt-10 pb-8">
        {/* Ambient glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[250px] h-[250px] rounded-full bg-hyper-blue/15 blur-[80px]" />
        <div className="absolute bottom-0 left-[-10%] w-[180px] h-[180px] rounded-full bg-hyper-blue/8 blur-[60px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,209,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-hyper-blue/15 border border-hyper-blue/20 flex items-center justify-center">
              <ClipboardList className="h-4.5 w-4.5 text-hyper-blue" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              CaseLog
            </span>
          </div>

          {/* Compact SVG Illustration */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4">
            <div className="absolute inset-2 rounded-full bg-white/[0.04] border border-white/[0.08]" />
            <svg
              viewBox="0 0 320 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full relative z-10"
            >
              <g transform="translate(110, 80)">
                <path
                  d="M50 30C50 13.4 63.4 0 80 0C96.6 0 100 13.4 100 30C100 60 50 100 50 100C50 100 0 60 0 30C0 13.4 3.4 0 20 0C36.6 0 50 13.4 50 30Z"
                  fill="url(#heartGradMobile)"
                  opacity="0.9"
                />
              </g>
              <path
                d="M20 180 L80 180 L95 180 L105 140 L115 220 L125 155 L135 195 L145 170 L155 180 L300 180"
                stroke="#00D1FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="600"
                  to="0"
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-dasharray"
                  values="0 600;600 0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
              <g transform="translate(50, 210)" opacity="0.45">
                <circle
                  cx="30"
                  cy="35"
                  r="16"
                  stroke="#00D1FF"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="30" cy="35" r="7" fill="#00D1FF" opacity="0.2" />
              </g>
              <g transform="translate(225, 220)" opacity="0.35">
                <rect
                  x="10"
                  y="0"
                  width="10"
                  height="30"
                  rx="3"
                  fill="#00D1FF"
                />
                <rect
                  x="0"
                  y="10"
                  width="30"
                  height="10"
                  rx="3"
                  fill="#00D1FF"
                />
              </g>
              <circle cx="70" cy="100" r="3" fill="#00D1FF" opacity="0.5">
                <animate
                  attributeName="opacity"
                  values="0.2;0.7;0.2"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="250" cy="130" r="2.5" fill="#00D1FF" opacity="0.4">
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <defs>
                <linearGradient
                  id="heartGradMobile"
                  x1="50"
                  y1="0"
                  x2="50"
                  y2="100"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#FF3131" />
                  <stop offset="100%" stopColor="#00D1FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">
            Modern Patient{" "}
            <span className="text-hyper-blue">Case Management</span>
          </h1>
          <p className="mt-1.5 text-xs text-white/45 leading-relaxed max-w-xs">
            Track cases, timelines, vitals & documents — secure & offline-ready.
          </p>

          {/* Compact stat pills */}
          <div className="mt-4 flex items-center gap-3 text-[10px] text-white/40">
            <span>
              <strong className="text-hyper-blue">HIPAA</strong> Compliant
            </span>
            <span className="w-px h-2.5 bg-white/10" />
            <span>
              <strong className="text-hyper-blue">PWA</strong> Ready
            </span>
            <span className="w-px h-2.5 bg-white/10" />
            <span>
              <strong className="text-hyper-blue">Offline</strong> First
            </span>
          </div>
        </div>
      </div>

      {/* ── Desktop Left Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-med-night">
        {/* Ambient glow blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-hyper-blue/15 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-hyper-blue/8 blur-[80px]" />
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-emergency-ruby/5 blur-[60px]" />

        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,209,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hyper-blue/15 backdrop-blur-sm border border-hyper-blue/20 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-hyper-blue" />
            </div>
            <span className="font-bold text-xl tracking-tight">CaseLog</span>
          </div>

          {/* Center — Medical Illustration + Text */}
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            {/* SVG Medical Illustration */}
            <div className="relative w-72 h-72 xl:w-80 xl:h-80 mb-8">
              {/* Outer pulse ring */}
              <div
                className="absolute inset-0 rounded-full border border-hyper-blue/10 animate-ping"
                style={{ animationDuration: "3s" }}
              />
              {/* Glass circle backdrop */}
              <div className="absolute inset-4 rounded-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]" />

              <svg
                viewBox="0 0 320 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10"
              >
                {/* Central heart shape */}
                <g transform="translate(110, 80)">
                  <path
                    d="M50 30C50 13.4 63.4 0 80 0C96.6 0 100 13.4 100 30C100 60 50 100 50 100C50 100 0 60 0 30C0 13.4 3.4 0 20 0C36.6 0 50 13.4 50 30Z"
                    fill="url(#heartGrad)"
                    opacity="0.9"
                  />
                </g>

                {/* ECG / Heartbeat line across */}
                <path
                  d="M20 180 L80 180 L95 180 L105 140 L115 220 L125 155 L135 195 L145 170 L155 180 L300 180"
                  stroke="#00D1FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="600"
                    to="0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-dasharray"
                    values="0 600;600 0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Stethoscope */}
                <g transform="translate(50, 200)" opacity="0.5">
                  <circle
                    cx="30"
                    cy="40"
                    r="18"
                    stroke="#00D1FF"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle cx="30" cy="40" r="8" fill="#00D1FF" opacity="0.2" />
                  <path
                    d="M30 22 L30 5 Q30 0 35 0 L45 0"
                    stroke="#00D1FF"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M48 22 L48 5 Q48 0 43 0 L45 0"
                    stroke="#00D1FF"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>

                {/* Medical cross */}
                <g transform="translate(220, 210)" opacity="0.4">
                  <rect
                    x="12"
                    y="0"
                    width="12"
                    height="36"
                    rx="3"
                    fill="#00D1FF"
                  />
                  <rect
                    x="0"
                    y="12"
                    width="36"
                    height="12"
                    rx="3"
                    fill="#00D1FF"
                  />
                </g>

                {/* DNA helix suggestion */}
                <g transform="translate(240, 60)" opacity="0.25">
                  <path
                    d="M0 0 Q15 15 0 30 Q-15 45 0 60"
                    stroke="#00D1FF"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M20 0 Q5 15 20 30 Q35 45 20 60"
                    stroke="#00D1FF"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <line
                    x1="2"
                    y1="15"
                    x2="18"
                    y2="15"
                    stroke="#00D1FF"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1="2"
                    y1="30"
                    x2="18"
                    y2="30"
                    stroke="#00D1FF"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1="2"
                    y1="45"
                    x2="18"
                    y2="45"
                    stroke="#00D1FF"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                </g>

                {/* Floating data dots */}
                <circle cx="70" cy="100" r="3" fill="#00D1FF" opacity="0.5">
                  <animate
                    attributeName="opacity"
                    values="0.2;0.7;0.2"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="250" cy="130" r="2.5" fill="#00D1FF" opacity="0.4">
                  <animate
                    attributeName="opacity"
                    values="0.4;0.1;0.4"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="180" cy="70" r="2" fill="#FF3131" opacity="0.3">
                  <animate
                    attributeName="opacity"
                    values="0.2;0.5;0.2"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                <defs>
                  <linearGradient
                    id="heartGrad"
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="100"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#FF3131" />
                    <stop offset="100%" stopColor="#00D1FF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Modern Patient
              <br />
              <span className="text-hyper-blue">Case Management</span>
            </h1>
            <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-sm">
              Track patient cases, timelines, vitals & documents — all in one
              secure, offline-ready platform.
            </p>

            {/* Glassmorphism Feature Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="glass-card flex items-start gap-3 p-3 rounded-2xl"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-hyper-blue/15">
                    <f.icon className="h-3.5 w-3.5 text-hyper-blue" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white/90">
                      {f.title}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center justify-center gap-8 text-xs text-white/40">
            <span>
              <strong className="text-hyper-blue">HIPAA</strong> Compliant
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span>
              <strong className="text-hyper-blue">PWA</strong> Ready
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span>
              <strong className="text-hyper-blue">Firebase</strong> Powered
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel — Sign In */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-8 lg:py-0">
        <div className="w-full max-w-sm">
          {/* Desktop-only heading context — mobile gets it from hero above */}
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              Sign in to access your patient cases
            </p>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full h-12 text-base rounded-xl shadow-sm"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
            >
              {signingIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[hsl(var(--border))]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[hsl(var(--background))] px-3 text-[hsl(var(--muted-foreground))]">
                  or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base rounded-xl"
              onClick={handleDemoSignIn}
              disabled={demoLoading || signingIn}
            >
              {demoLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
              ) : (
                <span className="mr-2">👀</span>
              )}
              Try Demo — No Sign-in Required
            </Button>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30">
                <p className="text-sm text-red-700 dark:text-red-300 text-center">
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
            <p className="text-xs text-center text-[hsl(var(--muted-foreground))] leading-relaxed">
              Secure sign-in powered by Firebase Authentication.
              <br />
              Your patient data is private and encrypted.
            </p>
          </div>

          {/* Mobile features — glass style */}
          <div className="lg:hidden mt-6 grid grid-cols-2 gap-2.5">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/10"
              >
                <f.icon className="h-3.5 w-3.5 text-[hsl(var(--primary))] shrink-0" />
                <span className="text-xs font-medium">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
