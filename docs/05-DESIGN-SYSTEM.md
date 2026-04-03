# 05 — CSS Design System

---

## Design Tokens

```css
:root {
  /* ===== LIGHT THEME COLORS ===== */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-card: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --border-light: #f1f5f9;

  /* Brand / Accent Colors — Medical Blue */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6; /* Primary action */
  --primary-600: #2563eb; /* Primary hover */
  --primary-700: #1d4ed8; /* Primary active */

  /* Status Colors */
  --status-active: #22c55e; /* Green — active case */
  --status-active-bg: #f0fdf4;
  --status-warning: #f59e0b; /* Amber — important */
  --status-warning-bg: #fffbeb;
  --status-critical: #ef4444; /* Red — critical */
  --status-critical-bg: #fef2f2;
  --status-discharged: #8b5cf6; /* Purple — discharged */
  --status-discharged-bg: #faf5ff;
  --status-neutral: #64748b; /* Gray — note/neutral */

  /* Entry Type Colors */
  --type-observation: #3b82f6; /* Blue */
  --type-treatment: #22c55e; /* Green */
  --type-medication: #a855f7; /* Purple */
  --type-procedure: #f59e0b; /* Amber */
  --type-lab-result: #06b6d4; /* Cyan */
  --type-imaging: #ec4899; /* Pink */
  --type-note: #64748b; /* Gray */
  --type-complication: #ef4444; /* Red */

  /* ===== TYPOGRAPHY SCALE ===== */
  --font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  --text-xs: 0.75rem; /* 12px — metadata, timestamps */
  --text-sm: 0.875rem; /* 14px — secondary text, labels */
  --text-base: 1rem; /* 16px — body text */
  --text-lg: 1.125rem; /* 18px — card titles */
  --text-xl: 1.25rem; /* 20px — section headings */
  --text-2xl: 1.5rem; /* 24px — page headings */
  --text-3xl: 1.875rem; /* 30px — dashboard hero text */
  --text-4xl: 2.25rem; /* 36px — stat numbers */

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* ===== SPACING SCALE (4px grid) ===== */
  --space-0: 0;
  --space-0-5: 0.125rem; /* 2px */
  --space-1: 0.25rem; /* 4px */
  --space-1-5: 0.375rem; /* 6px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */

  /* ===== BORDER RADIUS ===== */
  --radius-sm: 0.25rem; /* 4px — small elements */
  --radius-md: 0.5rem; /* 8px — cards, inputs */
  --radius-lg: 0.75rem; /* 12px — larger cards */
  --radius-xl: 1rem; /* 16px — dialogs */
  --radius-full: 9999px; /* pills, avatars */

  /* ===== SHADOWS ===== */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* ===== LAYOUT ===== */
  --sidebar-width: 240px;
  --sidebar-collapsed: 64px;
  --header-height: 64px;
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;

  /* ===== TRANSITIONS ===== */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

/* ===== DARK THEME ===== */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-color: #334155;
  --border-light: #1e293b;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
}

/* ===== SYSTEM THEME PREFERENCE ===== */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --bg-card: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border-color: #334155;
    --border-light: #1e293b;
  }
}
```

---

## Tailwind v4 CSS-First Theme Configuration

Tailwind CSS v4 uses CSS-first configuration — no `tailwind.config.ts` file needed. All customizations go in your CSS file:

```css
/* src/styles/index.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;

  --color-status-active: #22c55e;
  --color-status-warning: #f59e0b;
  --color-status-critical: #ef4444;
  --color-status-discharged: #8b5cf6;

  --color-entry-observation: #3b82f6;
  --color-entry-treatment: #22c55e;
  --color-entry-medication: #a855f7;
  --color-entry-procedure: #f59e0b;
  --color-entry-lab-result: #06b6d4;
  --color-entry-imaging: #ec4899;
  --color-entry-note: #64748b;
  --color-entry-complication: #ef4444;

  /* Fonts */
  --font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Layout */
  --spacing-sidebar: 240px;
  --spacing-sidebar-collapsed: 64px;
  --spacing-header: 64px;
}
```

> **Migration note:** Tailwind v4 exposes all theme values as CSS variables automatically. The custom CSS variables defined in the Design Tokens section above are still valid for non-Tailwind usage (e.g., inline styles, third-party libraries). For Tailwind classes, use `@theme` tokens instead.

---

## Component Style Patterns

### Cards

```css
.case-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}
.case-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-300);
}
```

### Status Badges

```css
.badge-active {
  background: var(--status-active-bg);
  color: var(--status-active);
}
.badge-warning {
  background: var(--status-warning-bg);
  color: var(--status-warning);
}
.badge-critical {
  background: var(--status-critical-bg);
  color: var(--status-critical);
}
.badge-discharged {
  background: var(--status-discharged-bg);
  color: var(--status-discharged);
}
```

### Timeline

```css
.timeline-line {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}
.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-primary);
  position: absolute;
  left: 15px;
}
```

---

## Theme Toggle Component

```html
<!-- Place in header/top bar -->
<div class="theme-toggle" role="radiogroup" aria-label="Theme selection">
  <button class="theme-option" data-theme="light" role="radio">
    <svg><!-- sun icon --></svg>
    <span class="sr-only">Light</span>
  </button>
  <button class="theme-option" data-theme="dark" role="radio">
    <svg><!-- moon icon --></svg>
    <span class="sr-only">Dark</span>
  </button>
  <button class="theme-option" data-theme="system" role="radio">
    <svg><!-- monitor icon --></svg>
    <span class="sr-only">System</span>
  </button>
</div>
```
