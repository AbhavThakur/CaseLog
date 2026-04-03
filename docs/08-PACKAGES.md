# 08 — Package List & Setup Guide

---

## NPM Packages

### Core Framework

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0"
  }
}
```

### UI & Styling

```json
{
  "dependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0"
  }
}
```

> **Note:** Tailwind CSS v4 uses CSS-first configuration — no `tailwind.config.ts` needed. Use `@tailwindcss/vite` plugin for best performance. shadcn/ui components are copied into `src/components/ui/` via CLI — they're not an npm dependency. The Radix packages above are what shadcn components depend on.

### Forms & Validation

```json
{
  "dependencies": {
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0"
  }
}
```

### Firebase

```json
{
  "dependencies": {
    "firebase": "^10.12.0"
  }
}
```

> We use the modular Firebase SDK (tree-shakeable). No need for `firebase-admin` unless we add server-side API routes later.

### Charts (Vitals)

```json
{
  "dependencies": {
    "recharts": "^2.12.0"
  }
}
```

### Date & Time

```json
{
  "dependencies": {
    "date-fns": "^3.6.0"
  }
}
```

### Image Processing

```json
{
  "dependencies": {
    "browser-image-compression": "^2.0.0"
  }
}
```

### Rich Text Editor (Phase 2 — optional for MVP)

```json
{
  "dependencies": {
    "@tiptap/react": "^2.5.0",
    "@tiptap/starter-kit": "^2.5.0"
  }
}
```

### PWA

```json
{
  "dependencies": {
    "vite-plugin-pwa": "^0.21.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^22.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

---

## Complete package.json

```json
{
  "name": "patient-case-tracker",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "firebase": "^11.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "browser-image-compression": "^2.0.0",
    "vite-plugin-pwa": "^0.21.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^22.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

---

## Firebase Project Setup Guide

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Name: `patient-case-tracker`
3. Enable Google Analytics (optional, free)
4. Click "Create project"

### Step 2: Enable Services

1. **Authentication:**
   - Go to Build → Authentication → Get Started
   - Enable "Google" sign-in provider
   - Enable "Email/Password" sign-in provider
   - Add authorized domains (your Vercel URL)

2. **Firestore:**
   - Go to Build → Firestore Database → Create Database
   - Choose region: `asia-south1` (Mumbai) or closest to your users
   - Start in test mode (we'll add security rules before sharing)

3. **Storage:**
   - Go to Build → Storage → Get Started
   - Choose same region as Firestore
   - Start in test mode

### Step 3: Get Config

1. Go to Project Settings → General → Your Apps
2. Click "Web" (</>) icon → Register app: `caselog-web`
3. Copy the Firebase config object

### Step 4: Environment Variables

Create `.env.local` in project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

> **Security Note:** `VITE_` prefix makes these available in the browser via `import.meta.env`. This is OK for Firebase — security is enforced by Security Rules, not by hiding the config. Never put admin credentials here.

---

## Quick Start Commands

```bash
# 1. Scaffold Vite + React + TypeScript project with shadcn/ui
pnpm dlx shadcn@latest init -t vite

# 2. Navigate to project
cd patient-case-tracker

# 3. Install core dependencies
pnpm add react-router firebase react-hook-form zod @hookform/resolvers recharts date-fns browser-image-compression lucide-react class-variance-authority clsx tailwind-merge

# 4. Add shadcn components
pnpm dlx shadcn@latest add button input label dialog select tabs toast avatar separator card badge dropdown-menu sheet chart

# 5. Install PWA support
pnpm add vite-plugin-pwa

# 6. Install dev tools
pnpm add -D prettier prettier-plugin-tailwindcss

# 7. Create .env.local with your Firebase config (see above)

# 8. Run dev server
pnpm dev
```

# 4. Add shadcn components

pnpm dlx shadcn@latest add button input label dialog select tabs toast avatar separator card badge dropdown-menu sheet chart

# 5. Install PWA support

pnpm add vite-plugin-pwa

# 6. Install dev tools

pnpm add -D prettier prettier-plugin-tailwindcss

# 7. Create .env.local with your Firebase config (see above)

# 8. Run dev server

pnpm dev

````

---

## Vercel Deployment

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial project setup"
git remote add origin https://github.com/YOUR_USERNAME/patient-case-tracker.git
git push -u origin main

# 2. Connect to Vercel
# Go to https://vercel.com → Import Git Repository
# Select your repo → Deploy
# Add environment variables in Vercel dashboard (same as .env.local)

# 3. Every push to main auto-deploys
````

---

## NPM Registry Note

> Per Best Buy standards, use the internal Artifactory npm registry:
>
> ```
> npm config set registry https://artifactory.tools.bestbuy.com/artifactory/api/npm/npm-virtual
> ```
>
> If this is a personal/external project, the default npm registry (`https://registry.npmjs.org`) is fine.
