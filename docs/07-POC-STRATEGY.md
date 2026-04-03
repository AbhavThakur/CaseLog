# 07 — POC Sharing Strategy

How to share the POC/MVP with doctors to gather feedback before building more.

---

## Two-Track Approach

### Track 1: Figma Clickable Prototype (Week 0-1)

**Purpose:** Get visual feedback BEFORE writing code.

### Track 2: Working MVP (Week 1-3)

**Purpose:** Get hands-on feedback with real data entry.

---

## Track 1: Figma Prototype

### What to Build in Figma

Create 5-7 key screens as interactive prototype:

1. **Login Page** — Google Sign-In button
2. **Dashboard** — Stats cards + recent cases
3. **Case List** — Cards with patient name, status, diagnosis
4. **New Case Form** — Patient details + admission info
5. **Case Detail + Timeline** — THE key screen to validate
6. **Add Entry Dialog** — Entry type, description, photo upload
7. **Vitals Chart** — Show what tracking looks like

### How to Share

- **Figma Prototype Link** — Shareable URL, no account needed to view
- Doctors tap through on their phone to feel the flow
- Include 2-3 preset demo patients with fake data

### Feedback Collection

- Create a **Google Form** with 10-15 questions:
  1. How do you currently track patient cases? (Paper / App / Notes / None)
  2. Would you use a tool like this? (1-5 scale)
  3. Is the timeline structure useful? (Yes / Somewhat / No)
  4. What fields are missing from the patient form?
  5. What entry types would you add?
  6. How fast must adding an entry be? (< 30s / < 1min / < 2min)
  7. Do you need to attach photos often? (Daily / Sometimes / Rarely)
  8. Would you use this on phone or tablet or both?
  9. Do you need to share cases with other doctors?
  10. What's your #1 frustration with current method?
  11. Would you want to export cases to PDF?
  12. Any features missing that would make you use this daily?
- Share Google Form link alongside Figma prototype

---

## Track 2: Working MVP

### Deployment

1. Deploy on **Vercel** (free hobby plan, instant deploys)
2. Custom subdomain: something like `caselog.vercel.app`
3. Enable Google Sign-In for doctor emails
4. Seed 2-3 demo cases with realistic data

### Sharing Method

- Send a link via WhatsApp/Email to the doctor group
- Include a 1-minute Loom/screen recording walkthrough
- Ask them to:
  1. Sign in with Google
  2. Create one patient case
  3. Add 2-3 timeline entries (with a photo)
  4. Browse the demo cases
  5. Fill out the feedback form

### Feedback Timeline

```
Week 0:   Share Figma prototype → Collect initial reactions
Week 1-2: Build working MVP
Week 3:   Deploy MVP → Share with doctors → Collect feedback
Week 4:   Review feedback → Prioritize Phase 2 features
```

---

## Alternative POC/MVP Tools (If not building custom)

### For Design Prototyping

| Tool                    | Best For                          | Sharing                       | Cost      |
| ----------------------- | --------------------------------- | ----------------------------- | --------- |
| **Figma** (Recommended) | Interactive clickable prototype   | Share link, no account needed | Free      |
| **Framer**              | High-fidelity animated prototypes | Publishable website           | Free tier |
| **Excalidraw**          | Quick wireframe sketches          | Share link                    | Free      |
| **Whimsical**           | Wireframes + flowcharts           | Share link                    | Free tier |

### For Working MVP (No-Code / Low-Code)

| Tool                   | Best For                            | Limitations                         | Cost      |
| ---------------------- | ----------------------------------- | ----------------------------------- | --------- |
| **v0.dev** (by Vercel) | AI-generated React UI from prompts  | UI only, no backend                 | Free      |
| **Bolt.new**           | Full-stack AI-generated app         | Can be buggy, limited customization | Free tier |
| **Lovable.dev**        | AI full-stack app builder           | Quality varies                      | Free tier |
| **Retool**             | Internal tools / dashboards         | Corporate look, not consumer-facing | Free tier |
| **Glide**              | Quick mobile app from Google Sheets | Limited customization               | Free tier |
| **Softr**              | Build apps on Airtable data         | Template-based                      | Free tier |

### Recommendation

**For your case:** Since you have developer capability and need a production-quality PWA eventually, go with:

1. **Figma** — Quick prototype to share NOW (1-2 days)
2. **Custom Next.js MVP** — Build the real thing (2-3 weeks)
3. **Vercel** — Deploy and share instantly

Using no-code tools like Bolt.new or Lovable for the POC is tempting but creates throwaway work. Building with Next.js from the start means your POC _becomes_ your product.

---

## Demo Data for POC

Seed these 3 cases for realistic feel:

### Case 1: Cardiac (Active)

- Patient: Rajesh Kumar, 58M, B+
- Complaint: Chest pain radiating to left arm
- Diagnosis: Acute Myocardial Infarction
- 5 timeline entries: ECG, troponin lab, PCI procedure, 2 observations
- Vitals: BP trending down, pulse stabilizing

### Case 2: Infectious Disease (Discharged)

- Patient: Priya Sharma, 32F, O+
- Complaint: High fever, body ache, low platelets
- Diagnosis: Dengue Fever
- 8 timeline entries: dailies, platelet count labs, IV fluids
- Outcome: Recovered

### Case 3: Surgical (Active)

- Patient: Amit Patel, 45M, A+
- Complaint: Acute appendicitis
- Diagnosis: Perforated appendix
- 6 entries: pre-op, surgery note, post-op complications, recovery
- Status: Improving

---

## Questions — Answered

| #   | Question                                               | Answer                                                               | Impact on Build                                                               |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Do you need multi-doctor access to the same case?      | **Possible in some scenarios** — need to support it                  | Add optional case sharing. Keep per-doctor ownership but allow invite-to-view |
| 2   | Is voice-to-text entry important?                      | **Not important**                                                    | Skip voice input. Not in any phase.                                           |
| 3   | Do you want to scan and attach physical reports (OCR)? | **Attach reports yes, OCR optional** — photo upload is sufficient    | Keep photo/PDF upload. Skip OCR. Can explore later if needed.                 |
| 4   | Is this for private practice, hospital, or both?       | **Private doctors** — for personal use or sharing among doctor peers | No multi-tenant/hospital admin needed. Single-user model with optional share  |
| 5   | Do patients need any access?                           | **No**                                                               | No patient portal. Doctor-only tool. Simplifies auth & data model.            |
| 6   | What device do you primarily use in the ward?          | **Varies by doctor** — phone, tablet, or desktop                     | Must be fully responsive. Mobile-first but desktop-optimized too.             |
| 7   | Do you need integrations with lab systems?             | **Not at the moment**                                                | No FHIR/HL7. Manual data entry only.                                          |
| 8   | Is data residency (where data is stored) a concern?    | **Not a concern, just be secure**                                    | Use nearest Firebase region (asia-south1). Standard security rules.           |
| 9   | Do you need to work offline in areas with poor signal? | **Nice to have for some data**                                       | Phase 2: PWA offline read-only cache for recent cases. Not critical for MVP.  |
| 10  | Would a template system (pre-filled entries) help?     | **Not required**                                                     | Skip templates. Doctors will type their own entries.                          |

### Key Takeaways for Architecture

- **Multi-doctor sharing (Q1):** Add a `sharedWith` array on cases. Shared doctors get read-only access. Keep it simple — no real-time collaboration, just view access. Move to Phase 2.
- **Private doctor tool (Q4+Q5):** No hospital admin, no patient portal. Each doctor owns their data. This significantly simplifies the data model.
- **Fully responsive (Q6):** Equal priority for mobile and desktop. No shortcuts on either.
- **Offline = Phase 2 (Q9):** PWA install in MVP, but offline caching deferred.

---

## AI-Powered Prototyping Guide (No Figma Skills Needed)

Since you're not familiar with Figma, here are AI tools that generate prototypes from text descriptions. **You don't need design skills.**

### Option 1: v0.dev (RECOMMENDED — Best for your case)

**What:** Vercel's AI tool that generates real React + Tailwind UI from text prompts.
**Why best:** The output is actual code you can use in your Next.js project. Your POC becomes your product.

**How to use:**

1. Go to [v0.dev](https://v0.dev)
2. Sign in with GitHub
3. Type a prompt describing each screen (see ready-made prompts below)
4. It generates a live preview + React code
5. Click "Add to Codebase" to copy the component
6. Share the v0 preview link with doctors for feedback

**Cost:** Free tier available (10 generations/month). Pro is $20/month.

**Ready-made prompts for your screens:**

**Prompt 1 — Dashboard:**

```
Create a medical dashboard for a patient case tracking app. Include:
- A header with app name "CaseLog" and a user avatar
- 4 stat cards: Active Cases (12), Today's Entries (3), Total Cases (47), Case Studies (5)
- A "Recent Cases" list showing 3 patient cards with: case number, patient name, diagnosis, admission date, number of timeline entries, and a colored status badge (green for active, purple for discharged, red for critical)
- A floating "+" button to add new case
- Use a clean medical blue color scheme, white background, subtle shadows
- Make it mobile-responsive
```

**Prompt 2 — Case Detail with Timeline:**

```
Create a patient case detail page with a timeline. Include:
- Back button and case number "CL-2026-0042" at top
- Patient info card: photo placeholder, name "Rajesh Kumar", age 58, male, blood group B+, chief complaint "Chest pain radiating to left arm", diagnosis "Acute MI", ward A room 204, admission date, days admitted count, green "Active" badge
- Action buttons: Edit, Discharge, Mark as Case Study, Export
- Tab bar: Timeline, Vitals Chart, Gallery, Summary
- Timeline section with entries grouped by date, each entry showing: time, type icon, type label (Observation/Medication/Procedure/Lab Result), title, description, optional vitals (BP, HR, SpO2), optional photo thumbnails, priority badge (normal/important/critical)
- An "Add Entry" floating button
- Clean medical blue theme, white cards with subtle borders
```

**Prompt 3 — New Case Form:**

```
Create a multi-section form for admitting a new patient. Sections:
1. Patient Demographics: name, age, gender (radio), blood group (dropdown), phone, emergency contact name/phone/relation
2. Admission Details: admission date/time, chief complaint (textarea), initial diagnosis, referred by (optional), ward, room number
3. Photo Upload: drag-and-drop area for admission photo
- Include form validation indicators
- Save and Cancel buttons at bottom
- Clean medical UI with card sections, blue accents
```

**Prompt 4 — Add Timeline Entry Dialog:**

```
Create a modal/dialog for adding a timeline entry to a patient case. Include:
- Entry type selector as pill buttons: Observation, Treatment, Medication, Procedure, Lab Result, Imaging, Note, Complication — each with a different color
- Title input field
- Description textarea (rich text style)
- Date and time pickers side by side
- Priority selector: Normal, Important (amber), Critical (red)
- Collapsible "Quick Vitals" section with: BP, Pulse, Temperature, SpO2, Respiratory Rate, Weight
- File upload area with camera icon and file upload icon, showing thumbnails of attached files
- Cancel and Save buttons
- Card-style modal with clean medical UI
```

---

### Option 2: Uizard (Best for non-designers)

**What:** AI that generates multi-screen clickable prototypes from text.
**Why good:** Produces a full clickable flow (not just individual screens). Specifically built for non-designers.

**How to use:**

1. Go to [uizard.io](https://uizard.io) → Sign up free
2. Click "Generate with Autodesigner"
3. Choose device: "Web App"
4. Enter prompt: "A medical dashboard for doctors to track patient cases with patient admission form, timeline of medical events with photos, vitals charts, and discharge summary. Clean blue medical theme."
5. Choose a style → Generate
6. It creates 4-6 linked screens you can click through
7. Share the prototype link with doctors

**Cost:** Free tier (2 projects, 10 screens). Pro $12/month.

---

### Option 3: Bolt.new / Lovable.dev (Full working app from prompt)

**What:** AI tools that generate a complete working web app (frontend + backend) from a description.
**Tradeoff:** Can generate a working demo fast, but the code quality is lower and harder to customize later.

**How to use:**

1. Go to [bolt.new](https://bolt.new) or [lovable.dev](https://lovable.dev)
2. Describe the full app in one prompt
3. It generates a working app you can deploy
4. Share the URL with doctors

**Best for:** A quick throwaway demo to validate interest. Not for production.

---

### Option 4: Figma + AI plugins (If you want to try Figma)

If you want to try Figma despite not knowing it:

1. Go to [figma.com](https://figma.com) → sign up free
2. Create new design file
3. Install the **"Uizard" Figma plugin** or **"Figma AI"** (built-in)
4. Use AI to generate screens from prompts inside Figma
5. Link screens together (click a button → set prototype link to next screen)
6. Share → "Share prototype" → Copy link

---

### My Recommendation

| Approach                 | Effort  | Output Quality | Reusable Code | Best For                 |
| ------------------------ | ------- | -------------- | ------------- | ------------------------ |
| **v0.dev** (Recommended) | 1-2 hrs | High           | Yes (React)   | POC that becomes product |
| Uizard                   | 1 hr    | Medium         | No            | Quick clickable mockup   |
| Bolt.new / Lovable       | 30 min  | Medium-Low     | Partial       | Throwaway demo           |
| Figma + AI               | 2-3 hrs | High           | No            | If you want design file  |

**Go with v0.dev.** Generate 4-5 key screens, share the preview links with your doctors, collect feedback, then copy the generated components into your real Next.js project. Zero wasted effort.
