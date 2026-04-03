# 04 — UX Architecture & Wireframes

---

## Information Architecture (Site Map)

```
CaseLog App
│
├── /login                          ← Google Sign-In / Email
│
├── /dashboard                      ← Home: quick stats + recent cases
│   ├── Active Cases count
│   ├── Today's Entries count
│   ├── Case Studies count
│   └── Recent 5 cases (cards)
│
├── /cases                          ← All Cases (list/grid view)
│   ├── Search bar + filters
│   ├── Sort: newest / oldest / status
│   └── Pagination or infinite scroll
│
├── /cases/new                      ← New Patient Case Form
│   ├── Patient Demographics
│   ├── Admission Details
│   └── Admission Photo (optional)
│
├── /cases/[caseId]                 ← Case Detail Page
│   ├── Patient Info Header
│   ├── Status Badge
│   ├── Quick Stats (days admitted, entry count)
│   ├── Vitals Chart (if data exists)
│   ├── Timeline (chronological entries)
│   │   ├── Add Entry button
│   │   ├── Filter by type
│   │   └── Each entry: type icon, title, desc, attachments, vitals
│   ├── Photo Gallery tab
│   └── Actions: Edit, Discharge, Mark as Case Study, Export
│
├── /cases/[caseId]/edit            ← Edit Patient/Admission Info
├── /cases/[caseId]/discharge       ← Discharge Form
│
├── /search                         ← Advanced Search
│   ├── Full-text search
│   ├── Filter by: tags, status, date, outcome
│   └── Results list
│
├── /profile                        ← Doctor Profile & Settings
│   ├── Name, specialization, hospital
│   ├── Theme toggle (light/dark/system)
│   └── Logout
│
└── Sidebar Navigation (persistent)
    ├── Dashboard
    ├── Cases
    ├── New Case (+)
    ├── Search
    ├── Case Studies
    └── Profile
```

---

## Page Layouts

### Layout Shell (All authenticated pages)

```
┌─────────────────────────────────────────────────────────┐
│  ┌────────┐                          🌙  👤 Dr. Smith  │  ← Header
│  │ CaseLog│     Dashboard | Cases | + New Case          │
│  └────────┘                                             │
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│  NAV   │            MAIN CONTENT AREA                   │
│        │                                                │
│  📊    │    (varies per page)                           │
│  📋    │                                                │
│  ➕    │                                                │
│  🔍    │                                                │
│  📚    │                                                │
│  👤    │                                                │
│        │                                                │
├────────┴────────────────────────────────────────────────┤
│  Mobile: Bottom navigation bar (5 icons)                │
└─────────────────────────────────────────────────────────┘
```

- **Desktop:** Sidebar nav (240px) + content area
- **Tablet:** Collapsed sidebar (64px icons only) + content area
- **Mobile:** No sidebar → bottom navigation bar

---

### Dashboard Page

```
┌──────────────────────────────────────────────────┐
│  Good morning, Dr. Smith           [+ New Case]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐│
│  │ 12       │ │  3       │ │  47      │ │ 5   ││
│  │ Active   │ │ Today's  │ │ Total    │ │Case ││
│  │ Cases    │ │ Entries  │ │ Cases    │ │Study││
│  └──────────┘ └──────────┘ └──────────┘ └─────┘│
│                                                  │
│  Recent Cases                        [View All →]│
│  ┌──────────────────────────────────────────────┐│
│  │ 🟢 CL-2026-0042  Rajesh Kumar              ││
│  │    Acute MI | Admitted 30 Mar | 3 entries    ││
│  ├──────────────────────────────────────────────┤│
│  │ 🟡 CL-2026-0041  Priya Sharma              ││
│  │    Dengue Fever | Admitted 28 Mar | 7 entries││
│  ├──────────────────────────────────────────────┤│
│  │ 🔴 CL-2026-0040  Amit Patel                ││
│  │    Post-op Sepsis | CRITICAL | 12 entries   ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  Quick Actions                                   │
│  [+ New Case]  [📷 Quick Photo Log]  [🔍 Search]│
└──────────────────────────────────────────────────┘
```

---

### Case Detail Page (Most Important Page)

```
┌──────────────────────────────────────────────────┐
│ ← Back to Cases          CL-2026-0042            │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────┐  Rajesh Kumar, 58M, B+    🟢 Active   │
│  │PHOTO│  Chief Complaint: Chest pain, dyspnea  │
│  └─────┘  Admitted: 30 Mar 2026 | Day 3          │
│           Ward A, Room 204                       │
│           Diagnosis: Acute MI                    │
│                                                  │
│  [Edit Info] [Discharge] [★ Case Study] [Export] │
│                                                  │
├──────────────────────────────────────────────────┤
│  [Timeline]  [Vitals Chart]  [Gallery]  [Summary]│
├──────────────────────────────────────────────────┤
│                                                  │
│  TIMELINE                    [+ Add Entry]       │
│  Filter: [All ▾] [Type ▾]                       │
│                                                  │
│  ── 2 Apr 2026 ─────────────────────────────     │
│  │                                               │
│  │  🩺 10:30 AM  OBSERVATION           ⚡Normal │
│  │  Morning rounds - Patient stable              │
│  │  BP: 130/85  HR: 78  SpO2: 96%              │
│  │  [photo1.jpg] [photo2.jpg]                   │
│  │                                               │
│  │  💊 08:00 AM  MEDICATION             Normal  │
│  │  Aspirin 75mg, Atorvastatin 40mg             │
│  │                                               │
│  ── 1 Apr 2026 ─────────────────────────────     │
│  │                                               │
│  │  🔬 03:00 PM  LAB RESULT          ⚠Important│
│  │  Troponin I: 2.8 ng/mL (elevated)           │
│  │  [lab-report.pdf]                            │
│  │                                               │
│  │  🏥 11:00 AM  PROCEDURE           🔴Critical│
│  │  PCI with stent placement - LAD              │
│  │  Duration: 45 mins, Successful               │
│  │  [angiogram-pre.jpg] [angiogram-post.jpg]   │
│  │                                               │
│  ── 30 Mar 2026 (Admission) ────────────────     │
│  │                                               │
│  │  📋 09:15 AM  ADMISSION              Normal  │
│  │  Patient presented with severe chest pain     │
│  │  radiating to left arm. ECG: ST elevation.   │
│  │  [ecg-admission.jpg]                         │
│  │                                               │
└──────────────────────────────────────────────────┘
```

---

### Timeline Entry Form (Dialog/Sheet)

```
┌──────────────────────────────────────────────────┐
│  Add Timeline Entry                         ✕    │
├──────────────────────────────────────────────────┤
│                                                  │
│  Entry Type                                      │
│  [🩺 Observation] [💊 Medication] [🏥 Procedure]│
│  [🔬 Lab Result] [🖼️ Imaging] [📋 Note]        │
│  [⚠️ Complication]                               │
│                                                  │
│  Title *                                         │
│  ┌──────────────────────────────────────────┐    │
│  │ Morning rounds observation               │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Description                                     │
│  ┌──────────────────────────────────────────┐    │
│  │ Patient stable, no complaints. Appetite  │    │
│  │ improved. Wound site clean, no signs of  │    │
│  │ infection.                                │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Date & Time                                     │
│  [2 Apr 2026] [10:30 AM]                        │
│                                                  │
│  Priority: ○ Normal  ○ Important  ○ Critical    │
│                                                  │
│  ── Quick Vitals (optional) ─────────────────   │
│  BP: [130/85]  Pulse: [78]  Temp: [98.6]       │
│  SpO2: [96]  Resp: [18]  Weight: [72]           │
│                                                  │
│  ── Attachments ─────────────────────────────   │
│  [📷 Camera] [📁 Upload File]                   │
│  ┌───────┐ ┌───────┐                           │
│  │ img1  │ │ img2  │  + Add more               │
│  └───────┘ └───────┘                           │
│                                                  │
│              [Cancel]  [Save Entry]              │
└──────────────────────────────────────────────────┘
```

---

### Vitals Chart Tab

```
┌──────────────────────────────────────────────────┐
│  Patient Vitals Overview         Last 7 days ▾   │
├──────────────────────────────────────────────────┤
│                                                  │
│  Blood Pressure                                  │
│  140┤                                            │
│  130┤    ╭──╮     ╭─╮                           │
│  120┤───╯    ╰───╯   ╰──────                    │
│  110┤                                            │
│     └──┬──┬──┬──┬──┬──┬──┬──                    │
│       30  31  1   2   3   4   5                  │
│                                                  │
│  Pulse                                           │
│  100┤                                            │
│   90┤ ╭╮                                        │
│   80┤╯  ╰─────╮     ╭──────                    │
│   70┤          ╰────╯                           │
│     └──┬──┬──┬──┬──┬──┬──┬──                    │
│       30  31  1   2   3   4   5                  │
│                                                  │
│  [+ Record Vitals]                               │
└──────────────────────────────────────────────────┘
```

---

## Navigation Patterns

### Mobile (Bottom Tab Bar)

```
┌──────────────────────────────────┐
│                                  │
│         (Content Area)           │
│                                  │
├──────────────────────────────────┤
│  🏠    📋    ➕    🔍    👤    │
│ Home  Cases  New  Search Profile │
└──────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint            | Layout Change                               |
| --------------------- | ------------------------------------------- |
| `< 640px` (mobile)    | Bottom nav, single column, full-width cards |
| `640-1024px` (tablet) | Icon-only sidebar (64px), 2-column grid     |
| `> 1024px` (desktop)  | Full sidebar (240px), 3-column stats grid   |

---

## User Flows

### Flow 1: Admit New Patient

```
Dashboard → Click "+ New Case" → Fill Patient Form → Fill Admission Details
→ Upload Photo (optional) → Submit → Redirect to Case Detail Page
```

### Flow 2: Log Daily Progress

```
Dashboard → Click Active Case → Case Detail (Timeline tab)
→ Click "+ Add Entry" → Select Entry Type → Fill details
→ Attach photos/files → Save → Entry appears in timeline
```

### Flow 3: Discharge Patient

```
Case Detail → Click "Discharge" → Fill Discharge Form
→ Final Diagnosis + Outcome + Summary → Submit
→ Case status changes to "Discharged"
```

### Flow 4: Reference Past Case

```
Search → Type condition/diagnosis → Filter by outcome
→ Browse matching cases → Open case detail → Review timeline
→ Optionally mark as "Case Study" for quick access
```

---

## Accessibility Considerations

- All form inputs have visible labels (not placeholder-only)
- Color is never the sole indicator (icons + color for status)
- Focus rings visible on all interactive elements
- Timeline entries navigable via keyboard (Tab + Enter)
- Image attachments have alt text (auto: filename, manual: optional)
- Minimum touch targets: 44x44px on mobile
- Contrast ratios: WCAG AA minimum (4.5:1 for text)
