# 02 — Tech Stack & Architecture

---

## Technology Stack

### Frontend

| Layer             | Technology                    | Version | Purpose                                            |
| ----------------- | ----------------------------- | ------- | -------------------------------------------------- |
| Build Tool        | **Vite**                      | 6+      | Fast dev server, HMR, optimized builds             |
| UI Framework      | **React**                     | 19      | Component-based UI, massive ecosystem              |
| Language          | **TypeScript**                | 5.x     | Type safety across the project                     |
| Router            | **React Router**              | 7.x     | Declarative routing, loaders, Vite-native          |
| UI Components     | **shadcn/ui**                 | latest  | Accessible, composable Radix + Tailwind components |
| Styling           | **Tailwind CSS**              | 4.x     | Utility-first CSS, CSS-first config, Vite plugin   |
| Charts            | **Recharts** (via shadcn/ui)  | 2.x     | Vitals tracking line/area charts                   |
| Forms             | **React Hook Form** + **Zod** | latest  | Form validation, schema enforcement                |
| Rich Text         | **Tiptap** or **Novel**       | latest  | Rich text for clinical notes                       |
| Date/Time         | **date-fns**                  | 3.x     | Lightweight date manipulation                      |
| Image Compression | **browser-image-compression** | latest  | Client-side photo resize before upload             |
| Icons             | **Lucide React**              | latest  | Clean medical-friendly icon set                    |
| PWA               | **vite-plugin-pwa**           | latest  | Service worker, offline caching, install prompt    |

### Backend & Services

| Service        | Technology                             | Purpose                                        |
| -------------- | -------------------------------------- | ---------------------------------------------- |
| Authentication | **Firebase Auth**                      | Google Sign-In, email/password, session tokens |
| Database       | **Cloud Firestore**                    | NoSQL document DB for patient data             |
| File Storage   | **Firebase Storage** (Cloud Storage)   | Photos, PDFs, clinical images                  |
| Hosting        | **Vercel**                             | Static site deployment, instant deploys        |
| Analytics      | **Firebase Analytics** (optional)      | Usage tracking                                 |
| Notifications  | **Firebase Cloud Messaging** (Phase 2) | Push notifications                             |

---

## Why Vite + React over Next.js?

This project is a **client-side Firebase app** — auth, Firestore reads/writes, and Storage uploads all happen in the browser. There is **no need for SSR** because:

- **No SEO needed** — doctor-only tool behind authentication
- **No server-side data fetching** — Firebase SDK runs client-side
- **No public pages** needing fast first-paint from server

Next.js's biggest strengths (Server Components, server actions, SSR/ISR) add complexity without corresponding value here. Every component would need `"use client"` anyway.

| Factor           | Next.js 15/16                                         | Vite + React                                     |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------ |
| SSR/SEO          | Built-in (not needed here)                            | SPA — perfect for auth-gated app                 |
| Firebase fit     | Awkward — server/client boundary confusion            | Perfect — pure client SDK, zero friction         |
| Dev speed        | Slower HMR, complex caching                           | Fastest HMR in ecosystem (Vite 6)                |
| PWA support      | next-pwa / Serwist (fiddly with SSR)                  | vite-plugin-pwa (gold standard)                  |
| Bundle size      | Heavier (server runtime, RSC overhead)                | Lighter — ships only what you use                |
| Complexity       | High — App Router, server/client boundaries           | Low — just React + router                        |
| Security surface | CVE-2025-29927 (CVSS 9.1), CVE-2025-55182 (CVSS 10.0) | Fewer abstraction layers = fewer attack surfaces |
| shadcn/ui        | Supported                                             | First-class Vite installation guide              |
| Vercel deploy    | Full SSR deploy                                       | Static deploy (simpler, cheaper)                 |

**Sources:** "Why We Migrated from Next.js to Vite and Hono" (Pluslide, Dec 2025) — 70% bug reduction after migration. Multiple community comparisons confirm Vite is preferred for client-side Firebase SPAs.

### Other Frameworks Considered

| Framework                        | Status            | Why Not                                                        |
| -------------------------------- | ----------------- | -------------------------------------------------------------- |
| TanStack Start                   | RC (not 1.0)      | Not production-ready. Don't bet a medical tool on RC software. |
| React Router v7 (Framework mode) | Stable            | More than needed — data mode is sufficient.                    |
| Remix                            | Merged into RR v7 | SSR focus doesn't benefit a Firebase SPA.                      |
| SvelteKit                        | Stable            | Different ecosystem — v0.dev React components wouldn't work.   |

---

## Why Firebase over Supabase?

| Factor              | Firebase                                             | Supabase                         |
| ------------------- | ---------------------------------------------------- | -------------------------------- |
| **Free Tier**       | Generous (1GB Firestore, 5GB Storage, 50K reads/day) | Good (500MB DB, 1GB storage)     |
| **Real-time**       | Built-in real-time listeners                         | Real-time via Postgres changes   |
| **Auth**            | Google Sign-In native, easy setup                    | Also good, but extra config      |
| **File Storage**    | Firebase Storage = Google Cloud Storage (robust)     | S3-compatible, 1GB free          |
| **Offline Support** | Native Firestore offline persistence                 | Requires custom implementation   |
| **Learning Curve**  | Lower for web apps                                   | Lower for SQL developers         |
| **Scaling Cost**    | Pay per read/write (can get expensive at scale)      | Predictable pricing              |
| **HIPAA**           | Available on Blaze plan with BAA                     | Available on Team plan ($599/mo) |

**Recommendation:** Start with **Firebase** for the MVP. The offline persistence, Google Auth integration, and generous free tier make it ideal for a doctor-facing mobile-first PWA. If the project scales or requires SQL, migrate to Supabase later.

---

## Firebase Storage vs Google Drive API for Files

### Firebase Storage (Recommended for V1)

```
✅ Integrated with Firebase Auth (automatic access control)
✅ Security Rules for per-user / per-case file access
✅ Built-in retry on poor network (critical for hospital Wi-Fi)
✅ 5 GB free on Spark plan
✅ Direct upload from browser, progress tracking
✅ Serves files via CDN
❌ Not browsable by user outside the app
❌ 5 GB limit on free plan
```

### Google Drive API (Optional Phase 2 feature)

```
✅ Doctors can browse files in their own Google Drive
✅ 15 GB free per Google account
✅ Familiar interface for non-technical users
✅ Easy sharing with colleagues
❌ Requires OAuth consent screen setup
❌ More complex auth flow (Drive scope permissions)
❌ API quotas and rate limits
❌ File organization is harder to enforce
```

### Hybrid Strategy (Recommended)

```
Phase 1: Firebase Storage for all uploads
  - All photos, PDFs stored in Firebase Storage
  - Organized by: /cases/{caseId}/{entryId}/{filename}
  - Security rules: only case owner can read/write

Phase 2: Google Drive Export
  - "Export to Drive" button per case
  - Creates a folder in doctor's Google Drive
  - Copies all case files + generates a summary PDF
  - Doctor can then share the Drive folder with colleagues
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                 CLIENT (PWA)                         │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Vite +   │  │ Service  │  │ IndexedDB        │  │
│  │ React    │  │ Worker   │  │ (offline cache)  │  │
│  │ Router   │  │ (PWA)    │  │                  │  │
│  └────┬─────┘  └─────┬────┘  └────────┬─────────┘  │
│       │              │               │              │
└───────┼──────────────┼───────────────┼──────────────┘
        │              │               │
        ▼              ▼               ▼
┌───────────────────────────────────────────────────┐
│              FIREBASE SERVICES                     │
│                                                    │
│  ┌──────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Firebase     │  │ Cloud      │  │ Firebase   │ │
│  │  Auth         │  │ Firestore  │  │ Storage    │ │
│  │              │  │            │  │            │ │
│  │ - Google     │  │ - Patient  │  │ - Photos   │ │
│  │   Sign-In    │  │   cases    │  │ - PDFs     │ │
│  │ - Email/Pass │  │ - Timeline │  │ - Scans    │ │
│  │ - Sessions   │  │ - Vitals   │  │ - Reports  │ │
│  └──────────────┘  └────────────┘  └────────────┘ │
│                                                    │
│  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  Vercel       │  │ Security Rules             │  │
│  │  (Static)     │  │ - Per-user data isolation  │  │
│  │               │  │ - Case-level permissions   │  │
│  └──────────────┘  └────────────────────────────┘  │
└───────────────────────────────────────────────────┘
        │
        ▼ (Phase 2)
┌───────────────────────┐
│  Google Drive API     │
│  - Case export        │
│  - Folder creation    │
│  - File sharing       │
└───────────────────────┘
```

---

## Folder Structure (Vite + React Project)

```
patient-case-tracker/
├── public/
│   ├── favicon.ico
│   └── icons/                 # PWA icons (192, 512)
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Root component with router
│   ├── routes/
│   │   ├── __root.tsx         # Root layout with providers
│   │   ├── login.tsx          # Login page
│   │   ├── dashboard.tsx      # Dashboard home (recent cases)
│   │   ├── cases/
│   │   │   ├── index.tsx      # All cases list
│   │   │   ├── new.tsx        # Create new case
│   │   │   └── $caseId/
│   │   │       ├── index.tsx  # Case detail + timeline
│   │   │       ├── edit.tsx   # Edit case info
│   │   │       └── discharge.tsx
│   │   ├── profile.tsx        # Doctor profile
│   │   └── search.tsx         # Search cases
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Shell, Sidebar, Header
│   │   ├── cases/             # CaseCard, CaseForm, etc.
│   │   ├── timeline/          # TimelineEntry, TimelineForm
│   │   ├── vitals/            # VitalsChart, VitalsForm
│   │   └── shared/            # FileUploader, ThemeToggle, etc.
│   ├── lib/
│   │   ├── firebase.ts        # Firebase initialization
│   │   ├── auth.ts            # Auth helpers
│   │   ├── firestore.ts       # Firestore CRUD operations
│   │   ├── storage.ts         # Firebase Storage helpers
│   │   ├── schemas.ts         # Zod validation schemas
│   │   └── utils.ts           # General utilities
│   ├── hooks/
│   │   ├── useAuth.ts         # Auth state hook
│   │   ├── useCases.ts        # Cases data hook
│   │   └── useTimeline.ts     # Timeline data hook
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── styles/
│       └── index.css          # Tailwind v4 (@import "tailwindcss")
├── .env.local                 # Firebase config (gitignored)
├── index.html                 # Vite entry HTML
├── vite.config.ts             # Vite + Tailwind + PWA config
├── tsconfig.json
├── tsconfig.app.json
├── package.json
└── docs/                      # This documentation folder
```

---

## Security Considerations

### Data Privacy

- All patient data stored in Firestore with per-user Security Rules
- No patient PII in URLs, logs, or analytics
- HTTPS enforced everywhere
- File uploads scoped to authenticated user + specific case

### Firestore Security Rules (Example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Doctors can only access their own data
    match /doctors/{doctorId} {
      allow read, write: if request.auth != null && request.auth.uid == doctorId;
    }

    // Cases belong to a doctor
    match /doctors/{doctorId}/cases/{caseId} {
      allow read, write: if request.auth != null && request.auth.uid == doctorId;

      // Timeline entries within a case
      match /timeline/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == doctorId;
      }
    }
  }
}
```

### Firebase Storage Rules (Example)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cases/{doctorId}/{caseId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == doctorId;
    }
  }
}
```

---

## Cost Estimate (Firebase Spark → Blaze)

### Free Tier (Spark Plan) — Good for MVP

| Service           | Free Limit           | Estimated Use (MVP) |
| ----------------- | -------------------- | ------------------- |
| Firestore Reads   | 50,000/day           | ~10,000/day         |
| Firestore Writes  | 20,000/day           | ~2,000/day          |
| Firestore Storage | 1 GB                 | ~200 MB             |
| Firebase Storage  | 5 GB                 | ~2 GB               |
| Firebase Auth     | 10K verifications/mo | ~50 users           |
| Hosting           | 10 GB/month transfer | ~1 GB               |

### Estimated Monthly Cost on Blaze (Pay-as-you-go) at Scale

| 50 doctors, ~5000 cases  | Estimated Cost   |
| ------------------------ | ---------------- |
| Firestore                | ~$5-15/month     |
| Firebase Storage (20 GB) | ~$1-3/month      |
| Auth                     | Free             |
| Hosting (Vercel)         | Free (hobby)     |
| **Total**                | **~$6-18/month** |

Firebase is effectively free for this scale of use.
