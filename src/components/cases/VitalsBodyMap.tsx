import { useState } from "react";
import {
  X,
  Heart,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Weight,
  Beaker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VitalsRecord } from "@/lib/types";
import type { PatientCase } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

interface Props {
  vitals: VitalsRecord[];
  patient: PatientCase["patient"];
  onClose: () => void;
}

/* ── Normal-range helpers ── */
const bpStatus = (sys?: number, dia?: number) => {
  if (!sys || !dia) return null;
  if (sys > 140 || dia > 90)
    return { label: "High", color: "text-emergency-ruby" };
  if (sys < 90 || dia < 60) return { label: "Low", color: "text-amber-400" };
  return { label: "Normal", color: "text-emerald-400" };
};
const hrStatus = (hr?: number) => {
  if (!hr) return null;
  if (hr > 100) return { label: "Tachycardia", color: "text-emergency-ruby" };
  if (hr < 60) return { label: "Bradycardia", color: "text-amber-400" };
  return { label: "Normal", color: "text-emerald-400" };
};
const spO2Status = (v?: number) => {
  if (v == null) return null;
  if (v < 90) return { label: "Critical", color: "text-emergency-ruby" };
  if (v < 95) return { label: "Low", color: "text-amber-400" };
  return { label: "Normal", color: "text-emerald-400" };
};
const tempStatus = (v?: number) => {
  if (!v) return null;
  if (v > 38.5) return { label: "High Fever", color: "text-emergency-ruby" };
  if (v > 37.5) return { label: "Low Fever", color: "text-amber-400" };
  if (v < 36) return { label: "Hypothermia", color: "text-amber-400" };
  return { label: "Normal", color: "text-emerald-400" };
};
const rrStatus = (v?: number) => {
  if (!v) return null;
  if (v > 20) return { label: "Elevated", color: "text-amber-400" };
  if (v < 12) return { label: "Low", color: "text-amber-400" };
  return { label: "Normal", color: "text-emerald-400" };
};

/* ── Animated pulse ring ── */
function PulseRing({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <span className="relative flex" style={{ width: size, height: size }}>
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${color}`}
      />
      <span
        className={`relative inline-flex rounded-full h-full w-full ${color}`}
      />
    </span>
  );
}

/* ── Small sparkline from vitals history ── */
function Sparkline({
  data,
  color,
}: {
  data: (number | undefined)[];
  color: string;
}) {
  const filtered = data.filter((v): v is number => v != null);
  if (filtered.length < 2) return null;
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = filtered
    .slice(-10)
    .map((v, i, arr) => {
      const x = (i / (arr.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/* ── Progress ring for SpO2 ── */
function ProgressRing({
  value,
  max = 100,
  size = 56,
  strokeWidth = 4,
  color,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / max) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
}

export function VitalsBodyMap({ vitals, patient, onClose }: Props) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const latest = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  if (!latest) return null;

  const bp = bpStatus(
    latest.bloodPressureSystolic,
    latest.bloodPressureDiastolic,
  );
  const hr = hrStatus(latest.pulse);
  const spo2 = spO2Status(latest.spO2);
  const temp = tempStatus(latest.temperature);
  const rr = rrStatus(latest.respiratoryRate);

  // Build sparkline data from history
  const hrHistory = vitals.map((v) => v.pulse);
  const spo2History = vitals.map((v) => v.spO2);
  const tempHistory = vitals.map((v) => v.temperature);
  const sysHistory = vitals.map((v) => v.bloodPressureSystolic);
  const bsHistory = vitals.map((v) => v.bloodSugar);

  return (
    <div className="fixed inset-0 z-50 bg-med-night/95 backdrop-blur-xl flex flex-col">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-hyper-blue/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-hyper-blue" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Vitals Overview</h2>
            <p className="text-white/40 text-xs">
              {patient.name} · {patient.age}y{" "}
              {patient.gender?.[0]?.toUpperCase()}
              {latest.recordedAt && (
                <>
                  {" "}
                  · Recorded {formatDate(latest.recordedAt.toDate())} at{" "}
                  {formatTime(latest.recordedAt.toDate())}
                </>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_1fr] gap-4 lg:gap-6 items-start">
            {/* ── Left Vitals Column ── */}
            <div className="space-y-3 order-2 lg:order-1">
              {/* Blood Pressure */}
              {latest.bloodPressureSystolic != null &&
                latest.bloodPressureDiastolic != null && (
                  <div
                    className={`glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                      activeHotspot === "bp"
                        ? "glow-blue ring-1 ring-hyper-blue/30"
                        : "hover:glow-blue"
                    }`}
                    onMouseEnter={() => setActiveHotspot("bp")}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emergency-ruby/20 flex items-center justify-center">
                          <Heart className="h-4 w-4 text-emergency-ruby" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                            Blood Pressure
                          </p>
                          {bp && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <PulseRing
                                color={
                                  bp.label === "Normal"
                                    ? "bg-emerald-400"
                                    : bp.label === "High"
                                      ? "bg-emergency-ruby"
                                      : "bg-amber-400"
                                }
                                size={6}
                              />
                              <span
                                className={`text-[10px] font-medium ${bp.color}`}
                              >
                                {bp.label}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Sparkline data={sysHistory} color="#ff3131" />
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">
                      {latest.bloodPressureSystolic}
                      <span className="text-lg text-white/30">
                        /{latest.bloodPressureDiastolic}
                      </span>
                      <span className="text-xs text-white/20 ml-1.5">mmHg</span>
                    </p>
                  </div>
                )}

              {/* Heart Rate */}
              {latest.pulse != null && (
                <div
                  className={`glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                    activeHotspot === "hr"
                      ? "glow-blue ring-1 ring-hyper-blue/30"
                      : "hover:glow-blue"
                  }`}
                  onMouseEnter={() => setActiveHotspot("hr")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          hr?.label !== "Normal"
                            ? "bg-emergency-ruby/20"
                            : "bg-hyper-blue/20"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            hr?.label !== "Normal"
                              ? "text-emergency-ruby animate-pulse"
                              : "text-hyper-blue"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                          Heart Rate
                        </p>
                        {hr && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <PulseRing
                              color={
                                hr.label === "Normal"
                                  ? "bg-emerald-400"
                                  : "bg-emergency-ruby"
                              }
                              size={6}
                            />
                            <span
                              className={`text-[10px] font-medium ${hr.color}`}
                            >
                              {hr.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Sparkline data={hrHistory} color="#00d1ff" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p
                      className={`text-3xl font-bold tracking-tight ${
                        hr?.label !== "Normal"
                          ? "text-emergency-ruby"
                          : "text-hyper-blue"
                      }`}
                    >
                      {latest.pulse}
                    </p>
                    <span className="text-xs text-white/30">bpm</span>
                  </div>
                  {/* ECG-style mini bars */}
                  <div className="mt-2 flex items-end gap-px h-5">
                    {[3, 8, 5, 14, 4, 9, 6, 16, 5, 7, 3, 12, 6, 9, 4, 8].map(
                      (h, i) => (
                        <div
                          key={i}
                          className={`w-[3px] rounded-full ${
                            hr?.label !== "Normal"
                              ? "bg-emergency-ruby/40"
                              : "bg-hyper-blue/30"
                          }`}
                          style={{
                            height: `${h}px`,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Respiratory Rate */}
              {latest.respiratoryRate != null && (
                <div
                  className={`glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                    activeHotspot === "rr"
                      ? "glow-blue ring-1 ring-hyper-blue/30"
                      : "hover:glow-blue"
                  }`}
                  onMouseEnter={() => setActiveHotspot("rr")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center">
                      <Wind className="h-4 w-4 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                        Respiratory Rate
                      </p>
                      {rr && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <PulseRing
                            color={
                              rr.label === "Normal"
                                ? "bg-emerald-400"
                                : "bg-amber-400"
                            }
                            size={6}
                          />
                          <span
                            className={`text-[10px] font-medium ${rr.color}`}
                          >
                            {rr.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {latest.respiratoryRate}
                    <span className="text-xs text-white/20 ml-1.5">
                      breaths/min
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* ── Center: Human Body SVG ── */}
            <div className="relative flex flex-col items-center order-1 lg:order-2 py-4">
              <div className="relative w-full max-w-[300px] mx-auto">
                {/* Ambient glow behind body */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-[75%] rounded-full bg-hyper-blue/[0.03] blur-[60px]" />
                </div>

                <svg
                  viewBox="0 0 200 540"
                  className="w-full h-auto relative z-10"
                  style={{
                    filter: "drop-shadow(0 0 24px rgba(0,209,255,0.04))",
                  }}
                >
                  <defs>
                    {/* Skin gradients — warm opaque skin tones */}
                    <linearGradient
                      id="skinLight"
                      x1="0.3"
                      y1="0"
                      x2="0.7"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#e8b896" />
                      <stop offset="50%" stopColor="#d4a07a" />
                      <stop offset="100%" stopColor="#c49068" />
                    </linearGradient>
                    <linearGradient id="skinShadow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#c49068" />
                      <stop offset="100%" stopColor="#a87856" />
                    </linearGradient>
                    <linearGradient
                      id="skinDark"
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#b8845c" />
                      <stop offset="100%" stopColor="#a07048" />
                    </linearGradient>
                    {/* Head gradient */}
                    <radialGradient id="headFill" cx="0.45" cy="0.4" r="0.55">
                      <stop offset="0%" stopColor="#e8c4a0" />
                      <stop offset="70%" stopColor="#d4a07a" />
                      <stop offset="100%" stopColor="#c08a62" />
                    </radialGradient>
                    {/* Tank top */}
                    <linearGradient
                      id="tankTop"
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f5f0eb" />
                      <stop offset="50%" stopColor="#ede5dc" />
                      <stop offset="100%" stopColor="#e0d5c8" />
                    </linearGradient>
                    {/* Shorts */}
                    <linearGradient
                      id="shortsFill"
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2d2d2d" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                    {/* Shoes */}
                    <linearGradient
                      id="shoeFill"
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#333333" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                    {/* Muscle definition line */}
                    <linearGradient id="muscleLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a07048" stopOpacity="0.4" />
                      <stop
                        offset="100%"
                        stopColor="#8a6040"
                        stopOpacity="0.2"
                      />
                    </linearGradient>
                    {/* Hotspot radial glows */}
                    <radialGradient id="glowR" cx=".5" cy=".5" r=".5">
                      <stop offset="0%" stopColor="#ff3131" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#ff3131" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="glowB" cx=".5" cy=".5" r=".5">
                      <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#00d1ff" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="glowT" cx=".5" cy=".5" r=".5">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="glowP" cx=".5" cy=".5" r=".5">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </radialGradient>
                    {/* Line glow filter */}
                    <filter
                      id="lglow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="2" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* ═══ REALISTIC HUMAN FIGURE WITH CLOTHING ═══ */}

                  {/* ── BACK LAYER: Left Arm (behind torso) ── */}
                  <path
                    d={`
                    M65 82 Q56 86 50 96 Q44 108 40 124 Q36 142 34 160
                    Q32 174 31 186 Q30 196 30 204
                    C30 210 29 216 28 222 Q26 232 24 240 Q22 248 21 254
                    L17 254 Q18 248 20 240 Q22 232 23 222
                    C24 216 24 210 24 204 Q24 196 25 186
                    Q26 174 28 160 Q30 142 33 124
                    Q36 108 40 96 Q44 88 52 82 Z
                  `}
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  {/* Left forearm */}
                  <path
                    d={`
                    M30 204 Q28 218 26 232 Q24 244 22 254
                    L17 254 Q19 244 21 232 Q23 218 24 204 Z
                  `}
                    fill="url(#skinShadow)"
                    stroke="#b8845c"
                    strokeWidth="0.2"
                  />
                  {/* Left hand */}
                  <path
                    d="M22 254 Q20 260 18 266 Q16 270 15 274 Q14 278 16 280 Q18 279 19 276 L20 270 Q20 274 19 278 Q18 282 20 283 Q22 282 22 278 L22 272 Q22 276 22 280 Q22 284 24 283 Q26 281 25 278 L24 272 Q25 276 26 280 Q27 282 26 276 Q24 268 22 254 Z"
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.25"
                  />

                  {/* ── BACK LAYER: Right Arm (behind torso) ── */}
                  <path
                    d={`
                    M135 82 Q144 86 150 96 Q156 108 160 124 Q164 142 166 160
                    Q168 174 169 186 Q170 196 170 204
                    C170 210 171 216 172 222 Q174 232 176 240 Q178 248 179 254
                    L183 254 Q182 248 180 240 Q178 232 177 222
                    C176 216 176 210 176 204 Q176 196 175 186
                    Q174 174 172 160 Q170 142 167 124
                    Q164 108 160 96 Q156 88 148 82 Z
                  `}
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  {/* Right forearm */}
                  <path
                    d={`
                    M170 204 Q172 218 174 232 Q176 244 178 254
                    L183 254 Q181 244 179 232 Q177 218 176 204 Z
                  `}
                    fill="url(#skinShadow)"
                    stroke="#b8845c"
                    strokeWidth="0.2"
                  />
                  {/* Right hand */}
                  <path
                    d="M178 254 Q180 260 182 266 Q184 270 185 274 Q186 278 184 280 Q182 279 181 276 L180 270 Q180 274 181 278 Q182 282 180 283 Q178 282 178 278 L178 272 Q178 276 178 280 Q178 284 176 283 Q174 281 175 278 L176 272 Q175 276 174 280 Q173 282 174 276 Q176 268 178 254 Z"
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.25"
                  />

                  {/* Arm muscle definition — left */}
                  <path
                    d="M48 100 Q44 120 40 140 Q37 155 35 170"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M56 92 Q50 110 46 130 Q43 148 40 165"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.35"
                  />
                  {/* Arm muscle definition — right */}
                  <path
                    d="M152 100 Q156 120 160 140 Q163 155 165 170"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M144 92 Q150 110 154 130 Q157 148 160 165"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.35"
                  />

                  {/* ── TANK TOP (over torso) ── */}
                  <path
                    d={`
                    M78 78
                    Q72 80 66 84
                    Q58 90 54 100
                    L50 120
                    Q48 134 48 150
                    L50 172
                    Q52 186 55 198
                    L58 208
                    Q62 214 68 218
                    Q76 222 86 224
                    L100 225
                    L114 224
                    Q124 222 132 218
                    Q138 214 142 208
                    L145 198
                    Q148 186 150 172
                    L152 150
                    Q152 134 150 120
                    L146 100
                    Q142 90 134 84
                    Q128 80 122 78
                    L116 77 Q110 80 100 80 Q90 80 84 77
                    Z
                  `}
                    fill="url(#tankTop)"
                    stroke="#c5bdb4"
                    strokeWidth="0.5"
                  />
                  {/* Tank top neckline */}
                  <path
                    d="M84 77 Q90 84 100 85 Q110 84 116 77"
                    fill="none"
                    stroke="#c5bdb4"
                    strokeWidth="0.6"
                  />
                  {/* Tank top arm holes */}
                  <path
                    d="M78 78 Q72 82 66 90"
                    fill="none"
                    stroke="#c5bdb4"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M122 78 Q128 82 134 90"
                    fill="none"
                    stroke="#c5bdb4"
                    strokeWidth="0.5"
                  />
                  {/* Chest/pec lines through tank top */}
                  <path
                    d="M68 106 Q82 98 96 100 Q99 101 100 106 Q101 101 104 100 Q118 98 132 106"
                    fill="none"
                    stroke="#c5bdb4"
                    strokeWidth="0.35"
                    opacity="0.6"
                  />
                  <path
                    d="M64 112 Q80 122 100 124 Q120 122 136 112"
                    fill="none"
                    stroke="#c5bdb4"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                  {/* Tank top bottom hem */}
                  <path
                    d="M68 218 Q84 224 100 225 Q116 224 132 218"
                    fill="none"
                    stroke="#c5bdb4"
                    strokeWidth="0.6"
                  />

                  {/* ── Neck + Head (skin) ── */}
                  {/* Neck */}
                  <path
                    d="M90 58 L88 74 Q87 78 90 80 L110 80 Q113 78 112 74 L110 58"
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.4"
                  />
                  {/* Neck shadow line */}
                  <path
                    d="M92 64 L91 74"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.3"
                  />
                  <path
                    d="M108 64 L109 74"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.3"
                  />

                  {/* Head */}
                  <ellipse
                    cx="100"
                    cy="34"
                    rx="20"
                    ry="26"
                    fill="url(#headFill)"
                    stroke="#b8845c"
                    strokeWidth="0.4"
                  />
                  {/* Ears */}
                  <ellipse
                    cx="79.5"
                    cy="36"
                    rx="3"
                    ry="6"
                    fill="url(#skinShadow)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  <ellipse
                    cx="120.5"
                    cy="36"
                    rx="3"
                    ry="6"
                    fill="url(#skinShadow)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  {/* Hair line (buzz cut suggestion) */}
                  <path
                    d="M82 18 Q90 9 100 8 Q110 9 118 18"
                    fill="none"
                    stroke="#8a6040"
                    strokeWidth="0.6"
                    opacity="0.3"
                  />
                  {/* Eyebrows */}
                  <path
                    d="M88 27 Q92 25 96 27"
                    fill="none"
                    stroke="#8a6040"
                    strokeWidth="0.5"
                    opacity="0.4"
                  />
                  <path
                    d="M104 27 Q108 25 112 27"
                    fill="none"
                    stroke="#8a6040"
                    strokeWidth="0.5"
                    opacity="0.4"
                  />
                  {/* Eyes */}
                  <ellipse
                    cx="92"
                    cy="30"
                    rx="3.5"
                    ry="1.5"
                    fill="none"
                    stroke="#8a6040"
                    strokeWidth="0.4"
                    opacity="0.35"
                  />
                  <ellipse
                    cx="108"
                    cy="30"
                    rx="3.5"
                    ry="1.5"
                    fill="none"
                    stroke="#8a6040"
                    strokeWidth="0.4"
                    opacity="0.35"
                  />
                  {/* Nose */}
                  <path
                    d="M99 36 Q100 40 101 36"
                    fill="none"
                    stroke="#b8845c"
                    strokeWidth="0.35"
                    opacity="0.4"
                  />
                  {/* Mouth */}
                  <path
                    d="M95 45 Q100 48 105 45"
                    fill="none"
                    stroke="#b8845c"
                    strokeWidth="0.35"
                    opacity="0.35"
                  />

                  {/* ── SHORTS ── */}
                  <path
                    d={`
                    M62 215
                    Q60 222 58 230
                    Q56 240 56 250
                    Q56 262 58 272
                    L60 280
                    Q62 286 64 290
                    L84 290
                    Q88 286 90 280
                    L94 272
                    Q96 266 98 262
                    L100 258
                    L102 262
                    Q104 266 106 272
                    L110 280
                    Q112 286 116 290
                    L136 290
                    Q138 286 140 280
                    L142 272
                    Q144 262 144 250
                    Q144 240 142 230
                    Q140 222 138 215
                    Z
                  `}
                    fill="url(#shortsFill)"
                    stroke="#111"
                    strokeWidth="0.4"
                  />
                  {/* Shorts waistband */}
                  <path
                    d="M62 215 Q80 220 100 221 Q120 220 138 215"
                    fill="none"
                    stroke="#444"
                    strokeWidth="0.8"
                  />
                  {/* Shorts center fold */}
                  <line
                    x1="100"
                    y1="222"
                    x2="100"
                    y2="258"
                    stroke="#111"
                    strokeWidth="0.3"
                    opacity="0.4"
                  />
                  {/* Shorts leg creases */}
                  <path
                    d="M74 260 Q76 270 78 280"
                    fill="none"
                    stroke="#111"
                    strokeWidth="0.25"
                    opacity="0.3"
                  />
                  <path
                    d="M126 260 Q124 270 122 280"
                    fill="none"
                    stroke="#111"
                    strokeWidth="0.25"
                    opacity="0.3"
                  />

                  {/* ── Left Leg (skin below shorts) ── */}
                  {/* Left thigh */}
                  <path
                    d={`
                    M58 290
                    Q62 308 64 326
                    Q66 344 66 360
                    Q66 370 66 376
                    L82 376
                    Q82 370 82 360
                    Q82 344 80 326
                    Q78 308 76 290
                    Z
                  `}
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  {/* Left knee */}
                  <ellipse
                    cx="74"
                    cy="376"
                    rx="9"
                    ry="5"
                    fill="url(#skinShadow)"
                    stroke="#b8845c"
                    strokeWidth="0.25"
                  />
                  {/* Left shin + calf */}
                  <path
                    d={`
                    M66 376
                    Q64 394 64 412
                    Q64 430 66 446
                    Q68 458 68 468
                    L80 468
                    Q80 458 78 446
                    Q76 430 76 412
                    Q76 394 78 376
                    Z
                  `}
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  {/* Left calf muscle */}
                  <path
                    d="M72 390 Q74 410 72 430 Q70 444 70 456"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.4"
                  />
                  <path
                    d="M68 392 Q66 408 66 424"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.3"
                  />
                  {/* Left thigh muscle line */}
                  <path
                    d="M68 294 Q70 310 72 328 Q74 346 74 362"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.35"
                  />

                  {/* ── Right Leg (skin below shorts) ── */}
                  <path
                    d={`
                    M124 290
                    Q122 308 120 326
                    Q118 344 118 360
                    Q118 370 118 376
                    L134 376
                    Q134 370 134 360
                    Q134 344 136 326
                    Q138 308 142 290
                    Z
                  `}
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  {/* Right knee */}
                  <ellipse
                    cx="126"
                    cy="376"
                    rx="9"
                    ry="5"
                    fill="url(#skinShadow)"
                    stroke="#b8845c"
                    strokeWidth="0.25"
                  />
                  {/* Right shin + calf */}
                  <path
                    d={`
                    M118 376
                    Q120 394 120 412
                    Q120 430 118 446
                    Q116 458 116 468
                    L128 468
                    Q128 458 130 446
                    Q132 430 132 412
                    Q132 394 130 376
                    Z
                  `}
                    fill="url(#skinLight)"
                    stroke="#b8845c"
                    strokeWidth="0.3"
                  />
                  {/* Right calf muscle */}
                  <path
                    d="M124 390 Q122 410 124 430 Q126 444 126 456"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.4"
                  />
                  <path
                    d="M130 392 Q132 408 132 424"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.3"
                  />
                  {/* Right thigh muscle line */}
                  <path
                    d="M132 294 Q130 310 128 328 Q126 346 126 362"
                    fill="none"
                    stroke="url(#muscleLine)"
                    strokeWidth="0.35"
                  />

                  {/* ── Left Shoe ── */}
                  <path
                    d={`
                    M68 468
                    Q66 472 64 476
                    Q60 482 54 486
                    Q48 490 44 488
                    Q42 486 44 484
                    Q48 482 52 480
                    L58 476
                    Q62 474 64 470
                    L68 468
                    L80 468
                    Q80 472 78 476
                    Q76 480 74 482
                    Q78 484 80 482
                    Q82 480 82 476
                    Q82 472 80 468 Z
                  `}
                    fill="url(#shoeFill)"
                    stroke="#111"
                    strokeWidth="0.4"
                  />
                  {/* Shoe laces */}
                  <path
                    d="M60 480 L64 478 L62 482 L66 480"
                    fill="none"
                    stroke="#666"
                    strokeWidth="0.3"
                  />
                  {/* Sole */}
                  <path
                    d="M44 488 Q54 492 68 490 Q76 488 80 486"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="0.8"
                    opacity="0.7"
                  />

                  {/* ── Right Shoe ── */}
                  <path
                    d={`
                    M128 468
                    Q130 472 132 476
                    Q136 482 142 486
                    Q148 490 152 488
                    Q154 486 152 484
                    Q148 482 144 480
                    L138 476
                    Q134 474 132 470
                    L128 468
                    L116 468
                    Q116 472 118 476
                    Q120 480 122 482
                    Q118 484 116 482
                    Q114 480 114 476
                    Q114 472 116 468 Z
                  `}
                    fill="url(#shoeFill)"
                    stroke="#111"
                    strokeWidth="0.4"
                  />
                  {/* Shoe laces */}
                  <path
                    d="M136 480 L132 478 L134 482 L130 480"
                    fill="none"
                    stroke="#666"
                    strokeWidth="0.3"
                  />
                  {/* Sole */}
                  <path
                    d="M152 488 Q142 492 128 490 Q120 488 116 486"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="0.8"
                    opacity="0.7"
                  />

                  {/* ══════ HOTSPOTS ══════ */}

                  {/* BP — left upper arm */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHotspot("bp")}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <circle
                      cx="36"
                      cy="155"
                      r="14"
                      fill="url(#glowR)"
                      opacity={activeHotspot === "bp" ? 1 : 0.35}
                      className="transition-opacity duration-300"
                    />
                    <circle
                      cx="36"
                      cy="155"
                      r="5"
                      fill="#ff3131"
                      fillOpacity={activeHotspot === "bp" ? 0.9 : 0.35}
                      stroke="#ff3131"
                      strokeWidth={activeHotspot === "bp" ? 1.5 : 0.7}
                      strokeOpacity={activeHotspot === "bp" ? 1 : 0.5}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx="36"
                      cy="155"
                      r="2"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    {activeHotspot === "bp" && (
                      <circle
                        cx="36"
                        cy="155"
                        r="5"
                        fill="none"
                        stroke="#ff3131"
                        strokeWidth="1"
                      >
                        <animate
                          attributeName="r"
                          values="5;12;5"
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0;0.6"
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>

                  {/* HR — Heart (left chest) */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHotspot("hr")}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <circle
                      cx="108"
                      cy="108"
                      r="14"
                      fill="url(#glowR)"
                      opacity={activeHotspot === "hr" ? 1 : 0.3}
                      className="transition-opacity duration-300"
                    />
                    <circle
                      cx="108"
                      cy="108"
                      r="5.5"
                      fill="#ff3131"
                      fillOpacity={activeHotspot === "hr" ? 0.9 : 0.3}
                      stroke="#ff3131"
                      strokeWidth={activeHotspot === "hr" ? 1.5 : 0.7}
                      strokeOpacity={activeHotspot === "hr" ? 1 : 0.4}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx="108"
                      cy="108"
                      r="2"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    {activeHotspot === "hr" && (
                      <circle
                        cx="108"
                        cy="108"
                        r="5.5"
                        fill="none"
                        stroke="#ff3131"
                        strokeWidth="1"
                      >
                        <animate
                          attributeName="r"
                          values="5.5;14;5.5"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.7;0;0.7"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>

                  {/* SpO2 — Lungs (right chest) */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHotspot("spo2")}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <circle
                      cx="90"
                      cy="112"
                      r="14"
                      fill="url(#glowT)"
                      opacity={activeHotspot === "spo2" ? 1 : 0.3}
                      className="transition-opacity duration-300"
                    />
                    <circle
                      cx="90"
                      cy="112"
                      r="5.5"
                      fill="#14b8a6"
                      fillOpacity={activeHotspot === "spo2" ? 0.9 : 0.3}
                      stroke="#14b8a6"
                      strokeWidth={activeHotspot === "spo2" ? 1.5 : 0.7}
                      strokeOpacity={activeHotspot === "spo2" ? 1 : 0.4}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx="90"
                      cy="112"
                      r="2"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    {activeHotspot === "spo2" && (
                      <circle
                        cx="90"
                        cy="112"
                        r="5.5"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="1"
                      >
                        <animate
                          attributeName="r"
                          values="5.5;13;5.5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0;0.6"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>

                  {/* RR — Lower lung */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHotspot("rr")}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <circle
                      cx="84"
                      cy="132"
                      r="12"
                      fill="url(#glowT)"
                      opacity={activeHotspot === "rr" ? 1 : 0.25}
                      className="transition-opacity duration-300"
                    />
                    <circle
                      cx="84"
                      cy="132"
                      r="4"
                      fill="#14b8a6"
                      fillOpacity={activeHotspot === "rr" ? 0.9 : 0.25}
                      stroke="#14b8a6"
                      strokeWidth={activeHotspot === "rr" ? 1.5 : 0.7}
                      strokeOpacity={activeHotspot === "rr" ? 1 : 0.35}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx="84"
                      cy="132"
                      r="1.5"
                      fill="white"
                      fillOpacity="0.85"
                    />
                    {activeHotspot === "rr" && (
                      <circle
                        cx="84"
                        cy="132"
                        r="4"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="1"
                      >
                        <animate
                          attributeName="r"
                          values="4;11;4"
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0;0.5"
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>

                  {/* Temp — Forehead */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHotspot("temp")}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <circle
                      cx="100"
                      cy="18"
                      r="12"
                      fill="url(#glowB)"
                      opacity={activeHotspot === "temp" ? 1 : 0.3}
                      className="transition-opacity duration-300"
                    />
                    <circle
                      cx="100"
                      cy="18"
                      r="4"
                      fill="#f97316"
                      fillOpacity={activeHotspot === "temp" ? 0.9 : 0.3}
                      stroke="#f97316"
                      strokeWidth={activeHotspot === "temp" ? 1.5 : 0.7}
                      strokeOpacity={activeHotspot === "temp" ? 1 : 0.4}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx="100"
                      cy="18"
                      r="1.5"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    {activeHotspot === "temp" && (
                      <circle
                        cx="100"
                        cy="18"
                        r="4"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="1"
                      >
                        <animate
                          attributeName="r"
                          values="4;11;4"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0;0.5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>

                  {/* Blood Sugar — Abdomen/Pancreas */}
                  {latest.bloodSugar != null && (
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveHotspot("bs")}
                      onMouseLeave={() => setActiveHotspot(null)}
                    >
                      <circle
                        cx="100"
                        cy="195"
                        r="14"
                        fill="url(#glowP)"
                        opacity={activeHotspot === "bs" ? 1 : 0.3}
                        className="transition-opacity duration-300"
                      />
                      <circle
                        cx="100"
                        cy="195"
                        r="5"
                        fill="#a855f7"
                        fillOpacity={activeHotspot === "bs" ? 0.9 : 0.3}
                        stroke="#a855f7"
                        strokeWidth={activeHotspot === "bs" ? 1.5 : 0.7}
                        strokeOpacity={activeHotspot === "bs" ? 1 : 0.4}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx="100"
                        cy="195"
                        r="2"
                        fill="white"
                        fillOpacity="0.9"
                      />
                      {activeHotspot === "bs" && (
                        <circle
                          cx="100"
                          cy="195"
                          r="5"
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="1"
                        >
                          <animate
                            attributeName="r"
                            values="5;13;5"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.5;0;0.5"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  )}

                  {/* Weight — Thigh area */}
                  {latest.weight != null && (
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveHotspot("wt")}
                      onMouseLeave={() => setActiveHotspot(null)}
                    >
                      <circle
                        cx="100"
                        cy="320"
                        r="12"
                        fill="url(#glowP)"
                        opacity={activeHotspot === "wt" ? 1 : 0.3}
                        className="transition-opacity duration-300"
                      />
                      <circle
                        cx="100"
                        cy="320"
                        r="4"
                        fill="#8b5cf6"
                        fillOpacity={activeHotspot === "wt" ? 0.9 : 0.3}
                        stroke="#8b5cf6"
                        strokeWidth={activeHotspot === "wt" ? 1.5 : 0.7}
                        strokeOpacity={activeHotspot === "wt" ? 1 : 0.4}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx="100"
                        cy="320"
                        r="1.5"
                        fill="white"
                        fillOpacity="0.9"
                      />
                      {activeHotspot === "wt" && (
                        <circle
                          cx="100"
                          cy="320"
                          r="4"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="1"
                        >
                          <animate
                            attributeName="r"
                            values="4;11;4"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.5;0;0.5"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  )}

                  {/* ══════ CONNECTION LINES (hover only) ══════ */}

                  {activeHotspot === "bp" && (
                    <g filter="url(#lglow)">
                      <path
                        d="M30 155 Q15 155 0 145"
                        fill="none"
                        stroke="#ff3131"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          values="0;-16"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle
                        cx="0"
                        cy="145"
                        r="3"
                        fill="#ff3131"
                        opacity="0.9"
                      />
                      <text
                        x="3"
                        y="140"
                        fill="#ff3131"
                        fontSize="7"
                        fontWeight="700"
                        opacity="0.85"
                        fontFamily="system-ui"
                      >
                        BP
                      </text>
                    </g>
                  )}
                  {activeHotspot === "hr" && (
                    <g filter="url(#lglow)">
                      <path
                        d="M114 108 Q145 98 175 90 Q190 86 200 82"
                        fill="none"
                        stroke="#ff3131"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          values="0;-16"
                          dur="0.8s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle
                        cx="200"
                        cy="82"
                        r="3"
                        fill="#ff3131"
                        opacity="0.9"
                      />
                      <text
                        x="172"
                        y="78"
                        fill="#ff3131"
                        fontSize="7"
                        fontWeight="700"
                        opacity="0.85"
                        fontFamily="system-ui"
                      >
                        HEART
                      </text>
                    </g>
                  )}
                  {activeHotspot === "rr" && (
                    <g filter="url(#lglow)">
                      <path
                        d="M76 132 Q48 148 24 162 Q10 170 0 178"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          values="0;-16"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle
                        cx="0"
                        cy="178"
                        r="3"
                        fill="#14b8a6"
                        opacity="0.9"
                      />
                      <text
                        x="3"
                        y="173"
                        fill="#14b8a6"
                        fontSize="7"
                        fontWeight="700"
                        opacity="0.85"
                        fontFamily="system-ui"
                      >
                        RESP
                      </text>
                    </g>
                  )}
                  {activeHotspot === "spo2" && (
                    <g filter="url(#lglow)">
                      <path
                        d="M96 112 Q140 100 170 90 Q188 84 200 78"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          values="0;-16"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle
                        cx="200"
                        cy="78"
                        r="3"
                        fill="#22d3ee"
                        opacity="0.9"
                      />
                      <text
                        x="174"
                        y="74"
                        fill="#22d3ee"
                        fontSize="7"
                        fontWeight="700"
                        opacity="0.85"
                        fontFamily="system-ui"
                      >
                        SpO2
                      </text>
                    </g>
                  )}
                  {activeHotspot === "temp" && (
                    <g filter="url(#lglow)">
                      <path
                        d="M106 18 Q140 34 170 52 Q186 64 200 76"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          values="0;-16"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle
                        cx="200"
                        cy="76"
                        r="3"
                        fill="#f97316"
                        opacity="0.9"
                      />
                      <text
                        x="172"
                        y="72"
                        fill="#f97316"
                        fontSize="7"
                        fontWeight="700"
                        opacity="0.85"
                        fontFamily="system-ui"
                      >
                        TEMP
                      </text>
                    </g>
                  )}
                  {activeHotspot === "bs" && (
                    <g filter="url(#lglow)">
                      <path
                        d="M106 195 Q145 200 172 210 Q190 218 200 224"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          values="0;-16"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle
                        cx="200"
                        cy="224"
                        r="3"
                        fill="#a855f7"
                        opacity="0.9"
                      />
                      <text
                        x="170"
                        y="220"
                        fill="#a855f7"
                        fontSize="7"
                        fontWeight="700"
                        opacity="0.85"
                        fontFamily="system-ui"
                      >
                        SUGAR
                      </text>
                    </g>
                  )}
                  {activeHotspot === "wt" && (
                    <g filter="url(#lglow)">
                      <path
                        d="M106 320 Q145 312 172 300 Q190 292 200 284"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          values="0;-16"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle
                        cx="200"
                        cy="284"
                        r="3"
                        fill="#8b5cf6"
                        opacity="0.9"
                      />
                      <text
                        x="170"
                        y="280"
                        fill="#8b5cf6"
                        fontSize="7"
                        fontWeight="700"
                        opacity="0.85"
                        fontFamily="system-ui"
                      >
                        WEIGHT
                      </text>
                    </g>
                  )}
                </svg>

                {/* LIVE badge */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                  <div className="glass-card rounded-full px-3 py-1 flex items-center gap-1.5">
                    <PulseRing color="bg-emerald-400" size={6} />
                    <span className="text-[10px] text-white/60 font-medium">
                      LIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient info pill */}
              <div className="glass-card rounded-2xl px-4 py-3 mt-4 text-center max-w-[240px] w-full">
                <p className="text-white font-semibold text-sm">
                  {patient.name}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {patient.age}y · {patient.gender} ·{" "}
                  {patient.bloodGroup ?? "—"}
                </p>
                {latest.weight && (
                  <p className="text-white/30 text-[10px] mt-1">
                    Weight: {latest.weight} kg
                  </p>
                )}
              </div>
            </div>

            {/* ── Right Vitals Column ── */}
            <div className="space-y-3 order-3">
              {/* SpO2 with ring */}
              {latest.spO2 != null && (
                <div
                  className={`glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                    activeHotspot === "spo2"
                      ? "glow-blue ring-1 ring-hyper-blue/30"
                      : "hover:glow-blue"
                  }`}
                  onMouseEnter={() => setActiveHotspot("spo2")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        spo2?.label !== "Normal"
                          ? "bg-emergency-ruby/20"
                          : "bg-cyan-500/20"
                      }`}
                    >
                      <Droplets
                        className={`h-4 w-4 ${
                          spo2?.label !== "Normal"
                            ? "text-emergency-ruby"
                            : "text-cyan-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                        SpO2
                      </p>
                      {spo2 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <PulseRing
                            color={
                              spo2.label === "Normal"
                                ? "bg-emerald-400"
                                : spo2.label === "Critical"
                                  ? "bg-emergency-ruby"
                                  : "bg-amber-400"
                            }
                            size={6}
                          />
                          <span
                            className={`text-[10px] font-medium ${spo2.color}`}
                          >
                            {spo2.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <ProgressRing
                        value={latest.spO2}
                        color={latest.spO2 < 95 ? "#ff3131" : "#22d3ee"}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {latest.spO2}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {latest.spO2}%
                      </p>
                      <Sparkline data={spo2History} color="#22d3ee" />
                    </div>
                  </div>
                </div>
              )}

              {/* Temperature */}
              {latest.temperature != null && (
                <div
                  className={`glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                    activeHotspot === "temp"
                      ? "glow-blue ring-1 ring-hyper-blue/30"
                      : "hover:glow-blue"
                  }`}
                  onMouseEnter={() => setActiveHotspot("temp")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          temp?.label === "High Fever"
                            ? "bg-emergency-ruby/20"
                            : "bg-orange-500/20"
                        }`}
                      >
                        <Thermometer
                          className={`h-4 w-4 ${
                            temp?.label === "High Fever"
                              ? "text-emergency-ruby"
                              : "text-orange-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                          Temperature
                        </p>
                        {temp && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <PulseRing
                              color={
                                temp.label === "Normal"
                                  ? "bg-emerald-400"
                                  : temp.label === "High Fever"
                                    ? "bg-emergency-ruby"
                                    : "bg-amber-400"
                              }
                              size={6}
                            />
                            <span
                              className={`text-[10px] font-medium ${temp.color}`}
                            >
                              {temp.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Sparkline data={tempHistory} color="#f97316" />
                  </div>
                  <p
                    className={`text-3xl font-bold tracking-tight ${
                      temp?.label === "High Fever"
                        ? "text-emergency-ruby"
                        : "text-white"
                    }`}
                  >
                    {latest.temperature}
                    <span className="text-sm text-white/30 ml-0.5">°C</span>
                  </p>
                </div>
              )}

              {/* Blood Sugar */}
              {latest.bloodSugar != null && (
                <div
                  className={`glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                    activeHotspot === "bs"
                      ? "glow-blue ring-1 ring-hyper-blue/30"
                      : "hover:glow-blue"
                  }`}
                  onMouseEnter={() => setActiveHotspot("bs")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Beaker className="h-4 w-4 text-purple-400" />
                      </div>
                      <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                        Blood Sugar
                      </p>
                    </div>
                    <Sparkline data={bsHistory} color="#a855f7" />
                  </div>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {latest.bloodSugar}
                    <span className="text-xs text-white/20 ml-1.5">mg/dL</span>
                  </p>
                </div>
              )}

              {/* Weight */}
              {latest.weight != null && (
                <div
                  className={`glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                    activeHotspot === "wt"
                      ? "glow-blue ring-1 ring-hyper-blue/30"
                      : "hover:glow-blue"
                  }`}
                  onMouseEnter={() => setActiveHotspot("wt")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <Weight className="h-4 w-4 text-violet-400" />
                    </div>
                    <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                      Weight
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {latest.weight}
                    <span className="text-xs text-white/20 ml-1.5">kg</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom: Vitals History ── */}
          {vitals.length > 1 && (
            <div className="mt-6 glass-card rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Recent Readings ({vitals.length} records)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      <th className="text-left py-2 px-2 font-medium">Time</th>
                      <th className="text-center py-2 px-2 font-medium">BP</th>
                      <th className="text-center py-2 px-2 font-medium">HR</th>
                      <th className="text-center py-2 px-2 font-medium">
                        SpO2
                      </th>
                      <th className="text-center py-2 px-2 font-medium">
                        Temp
                      </th>
                      <th className="text-center py-2 px-2 font-medium">RR</th>
                      {vitals.some((v) => v.bloodSugar != null) && (
                        <th className="text-center py-2 px-2 font-medium">
                          Sugar
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[...vitals]
                      .reverse()
                      .slice(0, 8)
                      .map((v) => (
                        <tr
                          key={v.id}
                          className="border-b border-white/5 text-white/60 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-2 px-2 text-white/40">
                            {v.recordedAt
                              ? `${formatDate(v.recordedAt.toDate())} ${formatTime(v.recordedAt.toDate())}`
                              : "—"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {v.bloodPressureSystolic && v.bloodPressureDiastolic
                              ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`
                              : "—"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {v.pulse ?? "—"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {v.spO2 != null ? `${v.spO2}%` : "—"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {v.temperature != null ? `${v.temperature}°` : "—"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {v.respiratoryRate ?? "—"}
                          </td>
                          {vitals.some((vr) => vr.bloodSugar != null) && (
                            <td className="text-center py-2 px-2">
                              {v.bloodSugar ?? "—"}
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
