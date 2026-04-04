/** Inline SVG illustrations used for empty states, onboarding, and 404. */

export function EmptyCasesIllustration({
  className = "w-40 h-40",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Clipboard */}
      <rect
        x="55"
        y="30"
        width="90"
        height="120"
        rx="10"
        fill="currentColor"
        className="text-[hsl(var(--muted))]"
      />
      <rect
        x="65"
        y="24"
        width="70"
        height="16"
        rx="8"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/30"
      />
      <circle
        cx="100"
        cy="32"
        r="4"
        fill="currentColor"
        className="text-[hsl(var(--primary))]"
      />
      {/* Lines */}
      <rect
        x="72"
        y="60"
        width="56"
        height="5"
        rx="2.5"
        fill="currentColor"
        className="text-[hsl(var(--muted-foreground))]/20"
      />
      <rect
        x="72"
        y="74"
        width="42"
        height="5"
        rx="2.5"
        fill="currentColor"
        className="text-[hsl(var(--muted-foreground))]/15"
      />
      <rect
        x="72"
        y="88"
        width="50"
        height="5"
        rx="2.5"
        fill="currentColor"
        className="text-[hsl(var(--muted-foreground))]/10"
      />
      {/* Plus circle */}
      <circle
        cx="100"
        cy="122"
        r="14"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/15"
      />
      <rect
        x="96"
        y="115"
        width="8"
        height="14"
        rx="2"
        fill="currentColor"
        className="text-[hsl(var(--primary))]"
      />
      <rect
        x="93"
        y="119"
        width="14"
        height="6"
        rx="2"
        fill="currentColor"
        className="text-[hsl(var(--primary))]"
      />
      {/* Decorative dots */}
      <circle
        cx="40"
        cy="70"
        r="3"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/20"
      />
      <circle
        cx="165"
        cy="90"
        r="4"
        fill="currentColor"
        className="text-emerald-500/20"
      />
      <circle
        cx="48"
        cy="130"
        r="2.5"
        fill="currentColor"
        className="text-amber-500/20"
      />
      <circle
        cx="158"
        cy="50"
        r="2"
        fill="currentColor"
        className="text-violet-500/20"
      />
    </svg>
  );
}

export function EmptySearchIllustration({
  className = "w-36 h-36",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Magnifying glass */}
      <circle
        cx="90"
        cy="85"
        r="40"
        stroke="currentColor"
        strokeWidth="8"
        className="text-[hsl(var(--muted))]"
      />
      <line
        x1="120"
        y1="115"
        x2="155"
        y2="150"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-[hsl(var(--muted-foreground))]/30"
      />
      {/* X in center */}
      <line
        x1="78"
        y1="73"
        x2="102"
        y2="97"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="text-[hsl(var(--muted-foreground))]/20"
      />
      <line
        x1="102"
        y1="73"
        x2="78"
        y2="97"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="text-[hsl(var(--muted-foreground))]/20"
      />
      {/* Dots */}
      <circle
        cx="45"
        cy="50"
        r="3"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/15"
      />
      <circle
        cx="160"
        cy="60"
        r="2.5"
        fill="currentColor"
        className="text-amber-500/15"
      />
    </svg>
  );
}

export function EmptyRemindersIllustration({
  className = "w-32 h-32",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Bell */}
      <path
        d="M100 35 C75 35 58 60 58 85 L58 110 L42 130 L158 130 L142 110 L142 85 C142 60 125 35 100 35Z"
        fill="currentColor"
        className="text-[hsl(var(--muted))]"
      />
      <ellipse
        cx="100"
        cy="130"
        rx="58"
        ry="6"
        fill="currentColor"
        className="text-[hsl(var(--muted-foreground))]/10"
      />
      {/* Clapper */}
      <circle
        cx="100"
        cy="143"
        r="10"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/25"
      />
      <circle
        cx="100"
        cy="30"
        r="5"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/30"
      />
      {/* Check */}
      <circle
        cx="100"
        cy="85"
        r="18"
        fill="currentColor"
        className="text-emerald-500/15"
      />
      <path
        d="M90 85 L97 93 L112 77"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-500/40"
      />
    </svg>
  );
}

export function NotFoundIllustration({
  className = "w-56 h-56",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Map / page with fold */}
      <rect
        x="50"
        y="30"
        width="140"
        height="130"
        rx="8"
        fill="currentColor"
        className="text-[hsl(var(--muted))]"
      />
      <path
        d="M50 30 L120 30 L105 80 L50 80 Z"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/10"
      />
      {/* Big 404 */}
      <text
        x="120"
        y="105"
        textAnchor="middle"
        fontSize="48"
        fontWeight="bold"
        fill="currentColor"
        className="text-[hsl(var(--muted-foreground))]/25"
        fontFamily="system-ui"
      >
        404
      </text>
      {/* Question mark */}
      <circle
        cx="120"
        cy="135"
        r="16"
        fill="currentColor"
        className="text-amber-500/15"
      />
      <text
        x="120"
        y="142"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill="currentColor"
        className="text-amber-500/40"
        fontFamily="system-ui"
      >
        ?
      </text>
      {/* Decorative */}
      <circle
        cx="35"
        cy="60"
        r="3"
        fill="currentColor"
        className="text-[hsl(var(--primary))]/20"
      />
      <circle
        cx="210"
        cy="80"
        r="4"
        fill="currentColor"
        className="text-rose-500/20"
      />
      <circle
        cx="40"
        cy="140"
        r="2"
        fill="currentColor"
        className="text-violet-500/20"
      />
      <circle
        cx="205"
        cy="140"
        r="3"
        fill="currentColor"
        className="text-emerald-500/20"
      />
    </svg>
  );
}

export function OnboardingCasesIllustration({
  className = "w-24 h-24",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="20"
        y="12"
        width="60"
        height="76"
        rx="8"
        fill="currentColor"
        className="text-blue-100 dark:text-blue-900/40"
      />
      <rect
        x="30"
        y="8"
        width="40"
        height="12"
        rx="6"
        fill="currentColor"
        className="text-blue-400/50"
      />
      <circle
        cx="50"
        cy="14"
        r="3"
        fill="currentColor"
        className="text-blue-500"
      />
      <rect
        x="30"
        y="32"
        width="40"
        height="4"
        rx="2"
        fill="currentColor"
        className="text-blue-300/60"
      />
      <rect
        x="30"
        y="42"
        width="30"
        height="4"
        rx="2"
        fill="currentColor"
        className="text-blue-300/40"
      />
      <rect
        x="30"
        y="52"
        width="35"
        height="4"
        rx="2"
        fill="currentColor"
        className="text-blue-300/30"
      />
      <circle
        cx="50"
        cy="72"
        r="8"
        fill="currentColor"
        className="text-blue-500/20"
      />
      <path
        d="M47 72 L49 75 L54 69"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-blue-500"
      />
    </svg>
  );
}

export function OnboardingTimelineIllustration({
  className = "w-24 h-24",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Vertical line */}
      <line
        x1="30"
        y1="15"
        x2="30"
        y2="85"
        stroke="currentColor"
        strokeWidth="3"
        className="text-emerald-300/40"
      />
      {/* Nodes */}
      <circle
        cx="30"
        cy="25"
        r="6"
        fill="currentColor"
        className="text-emerald-500"
      />
      <circle
        cx="30"
        cy="50"
        r="6"
        fill="currentColor"
        className="text-emerald-400"
      />
      <circle
        cx="30"
        cy="75"
        r="6"
        fill="currentColor"
        className="text-emerald-300"
      />
      {/* Cards */}
      <rect
        x="44"
        y="18"
        width="40"
        height="14"
        rx="4"
        fill="currentColor"
        className="text-emerald-100 dark:text-emerald-900/40"
      />
      <rect
        x="44"
        y="43"
        width="36"
        height="14"
        rx="4"
        fill="currentColor"
        className="text-emerald-100 dark:text-emerald-900/30"
      />
      <rect
        x="44"
        y="68"
        width="42"
        height="14"
        rx="4"
        fill="currentColor"
        className="text-emerald-100 dark:text-emerald-900/20"
      />
      {/* heartbeat */}
      <path
        d="M50 25 L55 20 L58 30 L62 22 L66 25 L72 25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-emerald-500"
      />
    </svg>
  );
}

export function OnboardingCameraIllustration({
  className = "w-24 h-24",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Camera body */}
      <rect
        x="18"
        y="30"
        width="64"
        height="48"
        rx="10"
        fill="currentColor"
        className="text-amber-100 dark:text-amber-900/40"
      />
      {/* Lens mount */}
      <circle
        cx="50"
        cy="54"
        r="18"
        fill="currentColor"
        className="text-amber-300/40"
      />
      <circle
        cx="50"
        cy="54"
        r="12"
        fill="currentColor"
        className="text-amber-500/30"
      />
      <circle
        cx="50"
        cy="54"
        r="6"
        fill="currentColor"
        className="text-amber-500"
      />
      {/* Flash */}
      <rect
        x="34"
        y="22"
        width="32"
        height="10"
        rx="5"
        fill="currentColor"
        className="text-amber-400/50"
      />
      {/* Shutter */}
      <circle
        cx="68"
        cy="38"
        r="3"
        fill="currentColor"
        className="text-amber-500"
      />
      {/* Image icon */}
      <rect
        x="60"
        y="60"
        width="24"
        height="20"
        rx="4"
        fill="currentColor"
        className="text-amber-200 dark:text-amber-800/40"
      />
      <circle
        cx="68"
        cy="67"
        r="3"
        fill="currentColor"
        className="text-amber-400"
      />
      <path
        d="M62 76 L68 70 L74 74 L80 68 L82 76"
        fill="currentColor"
        className="text-amber-500/50"
      />
    </svg>
  );
}

export function OnboardingBellIllustration({
  className = "w-24 h-24",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Bell */}
      <path
        d="M50 18 C37 18 28 32 28 45 L28 58 L20 68 L80 68 L72 58 L72 45 C72 32 63 18 50 18Z"
        fill="currentColor"
        className="text-rose-100 dark:text-rose-900/40"
      />
      <circle
        cx="50"
        cy="74"
        r="6"
        fill="currentColor"
        className="text-rose-400"
      />
      <circle
        cx="50"
        cy="14"
        r="3"
        fill="currentColor"
        className="text-rose-500/50"
      />
      {/* Sound waves */}
      <path
        d="M78 35 C82 40 84 48 82 55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-rose-400/40"
      />
      <path
        d="M85 30 C90 38 93 50 90 60"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-rose-300/25"
      />
      {/* Clock */}
      <circle
        cx="74"
        cy="78"
        r="10"
        fill="currentColor"
        className="text-rose-200 dark:text-rose-800/40"
      />
      <circle
        cx="74"
        cy="78"
        r="7"
        fill="currentColor"
        className="text-rose-100 dark:text-rose-900/40"
      />
      <line
        x1="74"
        y1="78"
        x2="74"
        y2="73"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-rose-500"
      />
      <line
        x1="74"
        y1="78"
        x2="78"
        y2="80"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-rose-400"
      />
    </svg>
  );
}

export function OnboardingShareIllustration({
  className = "w-24 h-24",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Document */}
      <rect
        x="22"
        y="20"
        width="40"
        height="55"
        rx="6"
        fill="currentColor"
        className="text-violet-100 dark:text-violet-900/40"
      />
      <rect
        x="30"
        y="32"
        width="24"
        height="3"
        rx="1.5"
        fill="currentColor"
        className="text-violet-300/50"
      />
      <rect
        x="30"
        y="40"
        width="18"
        height="3"
        rx="1.5"
        fill="currentColor"
        className="text-violet-300/35"
      />
      <rect
        x="30"
        y="48"
        width="20"
        height="3"
        rx="1.5"
        fill="currentColor"
        className="text-violet-300/25"
      />
      {/* Share nodes */}
      <circle
        cx="72"
        cy="30"
        r="9"
        fill="currentColor"
        className="text-violet-500/30"
      />
      <circle
        cx="72"
        cy="55"
        r="9"
        fill="currentColor"
        className="text-violet-500/30"
      />
      <circle
        cx="72"
        cy="80"
        r="9"
        fill="currentColor"
        className="text-violet-500/30"
      />
      {/* Share lines */}
      <line
        x1="58"
        y1="42"
        x2="65"
        y2="34"
        stroke="currentColor"
        strokeWidth="2"
        className="text-violet-400/40"
      />
      <line
        x1="58"
        y1="48"
        x2="65"
        y2="55"
        stroke="currentColor"
        strokeWidth="2"
        className="text-violet-400/40"
      />
      <line
        x1="58"
        y1="55"
        x2="65"
        y2="76"
        stroke="currentColor"
        strokeWidth="2"
        className="text-violet-400/40"
      />
      {/* Arrow */}
      <circle
        cx="72"
        cy="55"
        r="5"
        fill="currentColor"
        className="text-violet-500"
      />
    </svg>
  );
}
