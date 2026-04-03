# CaseLog — Patient Case Tracker

A modern, mobile-first web app for doctors to log, track, and review patient cases from admission to discharge. Built with React 19 + Vite 8 + Firebase.

## Demo

Click **"Try Demo"** on the login page — no sign-in required. Sample patient data is auto-loaded.

---

## Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| **Framework** | React 19 + TypeScript 6             |
| **Build**     | Vite 8 (Rolldown bundler)           |
| **Styling**   | Tailwind CSS 4 + shadcn/ui          |
| **Backend**   | Firebase (Auth, Firestore, Storage) |
| **Forms**     | React Hook Form + Zod 4             |
| **Charts**    | Recharts 3                          |
| **Icons**     | Lucide React                        |
| **PWA**       | vite-plugin-pwa + Workbox           |
| **Hosting**   | Vercel (SPA + serverless)           |
| **Testing**   | Vitest + Testing Library            |
| **Linting**   | ESLint 10 flat config + Prettier    |
| **Git Hooks** | Husky + lint-staged                 |

---

## Project Structure

```
patient-case-tracker/
├── public/                    # Static assets (favicon, PWA icons)
├── src/
│   ├── components/
│   │   ├── ui/                # 17 shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   ├── layout/            # AppLayout, Sidebar, Header
│   │   ├── cases/             # TimelineEntryForm, DischargeForm, VitalsChart
│   │   └── ErrorBoundary.tsx  # Global error boundary
│   ├── hooks/
│   │   ├── useAuth.tsx        # Auth context + provider
│   │   ├── useCases.ts        # Real-time case subscription
│   │   └── useTheme.ts        # Light/dark/system theme
│   ├── lib/
│   │   ├── firebase.ts        # Firebase init + IS_DEV flag + emulators
│   │   ├── auth.ts            # Google Sign-In + Anonymous (demo) auth
│   │   ├── firestore.ts       # All Firestore CRUD (16 exports)
│   │   ├── storage.ts         # File upload, compression, validation
│   │   ├── schemas.ts         # Zod validation schemas (6 schemas)
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── utils.ts           # Formatters, helpers, cn()
│   │   └── demo-data.ts       # Sample data seeder for demo accounts
│   ├── pages/
│   │   ├── LoginPage.tsx      # Google Sign-In + Demo mode
│   │   ├── DashboardPage.tsx  # Stats cards + recent cases
│   │   ├── CasesPage.tsx      # Case list with search/filter
│   │   ├── NewCasePage.tsx     # Multi-section admit form
│   │   ├── CaseDetailPage.tsx # Timeline + Vitals + Gallery tabs
│   │   ├── SearchPage.tsx     # Global search
│   │   ├── ProfilePage.tsx    # Doctor profile editor
│   │   └── NotFoundPage.tsx   # 404 page
│   ├── test/
│   │   └── setup.ts           # Vitest setup (jsdom + Firebase mocks)
│   ├── App.tsx                # Routes
│   ├── main.tsx               # Entry (ErrorBoundary + StrictMode)
│   └── index.css              # Tailwind + theme variables
├── .env.example               # Environment template
├── .env.local                 # Local secrets (git-ignored)
├── eslint.config.js           # ESLint 10 flat config
├── vercel.json                # SPA rewrites + API routes
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
├── tsconfig.json              # Strict TypeScript config
└── vite.config.ts             # Vite 8 + Tailwind + PWA + Vitest
```

---

## Data Model

```
/counters/caseCounter          → { count: number }
/doctors/{uid}                 → Doctor profile
/doctors/{uid}/cases/{id}      → PatientCase
/doctors/{uid}/cases/{id}/timeline/{id}  → TimelineEntry
/doctors/{uid}/cases/{id}/vitals/{id}    → VitalsRecord
```

Each doctor's data is fully isolated. Firestore security rules enforce `request.auth.uid == doctorId`.

---

## App Flow

```
Login ─┬─ Google Sign-In ──► Dashboard ──► Cases List ──► Case Detail
       └─ Try Demo ────────►     │                            │
                                 ├─► New Case (Admit)         ├─► Timeline
                                 ├─► Search                   ├─► Vitals Chart
                                 └─► Profile                  ├─► Discharge
                                                              └─► Gallery
```

---

## Quick Start

### Prerequisites

- Node.js 22+
- A Firebase project (see "Firebase Setup" below)

### Install & Run

```bash
git clone https://github.com/AbhavThakur/CaseLog.git
cd CaseLog
cp .env.example .env.local      # Fill in your Firebase config
npm install
npm run dev                      # http://localhost:5173
```

### Scripts

| Command                 | Purpose                          |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start dev server (HMR)           |
| `npm run build`         | Type-check + production build    |
| `npm run preview`       | Preview production build locally |
| `npm run lint`          | Run ESLint                       |
| `npm run test`          | Run tests once                   |
| `npm run test:watch`    | Watch mode tests                 |
| `npm run test:coverage` | Coverage report                  |

---

## Environment Variables

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

| Variable                            | Purpose                                        |
| ----------------------------------- | ---------------------------------------------- |
| `VITE_ENV`                          | `dev` or `production` — controls `IS_DEV` flag |
| `VITE_FIREBASE_API_KEY`             | Firebase Web API Key                           |
| `VITE_FIREBASE_AUTH_DOMAIN`         | `your-project.firebaseapp.com`                 |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                            |
| `VITE_FIREBASE_STORAGE_BUCKET`      | `your-project.appspot.com`                     |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                   |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                                |
| `VITE_USE_EMULATORS`                | `true` to connect to local emulators           |

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → Name it `caselog-prod` (or `caselog-dev`)
3. Disable Google Analytics (optional for dev)
4. Click **Create project**

### 2. Enable Authentication

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** provider → Add your support email → Save
3. Enable **Anonymous** provider (for demo mode) → Save

### 3. Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Select **production mode** (we'll use our own rules)
3. Choose a region close to your users (e.g., `asia-south1` for India)
4. After creation, go to **Rules** tab → Paste contents of `firestore.rules`

### 4. Enable Cloud Storage

1. Firebase Console → **Storage** → **Get started**
2. Go to **Rules** tab → Paste contents of `storage.rules`

### 5. Get Config Keys

1. Firebase Console → **Project Settings** → **General** → Scroll to **Your apps**
2. Click **Web app** (</>) → Register app name `CaseLog Web`
3. Copy the config values into `.env.local`

### 6. Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Git Repository
3. Add all `VITE_*` environment variables in Vercel Dashboard
4. Set `VITE_ENV=production` for the Production environment
5. Deploy — Vercel auto-detects Vite

---

## GitHub Setup

### Recommended Repository Name

**`CaseLog`** — clean, branded, memorable.

### Steps

```bash
cd patient-case-tracker
git init
git add .
git commit -m "feat: initial CaseLog setup — React 19 + Vite 8 + Firebase"
git branch -M main
git remote add origin https://github.com/AbhavThakur/CaseLog.git
git push -u origin main
```

### Recommended GitHub Settings

- **Description:** "Patient Case Tracker for doctors — React 19 + Firebase + PWA"
- **Topics:** `react`, `firebase`, `medical`, `pwa`, `vite`, `typescript`
- **Branch protection:** Require PR reviews on `main`
- **Secrets:** Add `VITE_*` vars as GitHub Secrets for CI

---

## Build Output

```
dist/
├── index.html           (1.2 KB)
├── assets/
│   ├── index-*.css      (39 KB → 8 KB gzipped)
│   ├── index-*.js       (619 KB → 189 KB gzipped)   ← app code
│   ├── firebase-*.js    (460 KB → 138 KB gzipped)   ← Firebase SDK
│   └── recharts-*.js    (361 KB → 106 KB gzipped)   ← Charts
├── sw.js                                              ← Service Worker
└── manifest.webmanifest                               ← PWA manifest
```

Firebase and Recharts are code-split into separate chunks for optimal caching.

---

## Security

- **Firestore rules**: Per-doctor data isolation, authenticated-only access
- **Storage rules**: Per-doctor paths, 10MB limit, image/PDF types only
- **Client-side**: Zod validation on all forms, file type/size validation before upload
- **Auth**: Firebase Authentication (Google + Anonymous)
- **PWA**: HTTPS-only service worker

---

## License

Private — All rights reserved.
