# 06 — MVP Scope & Phases

---

## MVP Definition (Phase 1) — Share with Doctors

The MVP should be **usable in 1-2 minutes** by a doctor. No sign-up friction, no complexity. The goal is to validate:

1. Do doctors actually want a structured patient timeline?
2. Is the entry workflow fast enough for bedside use?
3. What fields/features do they actually need vs. what we assumed?

---

## Phase 1: MVP (2-3 weeks)

### Must Have (P0)

| Feature                          | Pages               | Status |
| -------------------------------- | ------------------- | ------ |
| Google Sign-In                   | `/login`            | ⬜     |
| Doctor profile setup             | `/profile`          | ⬜     |
| Create new patient case          | `/cases/new`        | ⬜     |
| View all cases (list)            | `/cases`            | ⬜     |
| Case detail with patient info    | `/cases/[id]`       | ⬜     |
| Add timeline entry (all types)   | Dialog on case page | ⬜     |
| View timeline (chronological)    | Case detail page    | ⬜     |
| Attach photos to entries         | Entry form          | ⬜     |
| Basic case search (name, status) | `/cases` filter     | ⬜     |
| Mobile responsive layout         | All pages           | ⬜     |
| Light/Dark theme toggle          | Header              | ⬜     |

### Nice to Have (P1) — add if time permits

| Feature                         | Effort |
| ------------------------------- | ------ |
| Vitals quick-add per entry      | Low    |
| Case status badges              | Low    |
| PWA install prompt              | Medium |
| Image compression before upload | Medium |
| Discharge form                  | Medium |

### Not in MVP (defer to Phase 2+)

- Vitals chart
- Advanced search with tags
- Case study marking
- PDF export
- Offline caching
- Google Drive export
- Collaborator access

---

## Phase 2: Core Features (Weeks 4-6)

| Feature                          | Priority |
| -------------------------------- | -------- |
| Discharge flow & case closure    | P0       |
| Vitals tracking chart (Recharts) | P0       |
| Case tagging (conditions)        | P1       |
| Mark as case study               | P1       |
| Filter timeline by entry type    | P1       |
| Gallery view per case            | P1       |
| PWA with offline read-only cache | P1       |
| Image compression (client-side)  | P1       |
| Quick stats on dashboard         | P1       |

---

## Phase 3: Polish & Export (Weeks 7-10)

| Feature                                     | Priority |
| ------------------------------------------- | -------- |
| Advanced search (tags, date range, outcome) | P0       |
| PDF export of case                          | P1       |
| Google Drive export                         | P2       |
| Shareable read-only case link               | P2       |
| Push notifications (collaborator updates)   | P2       |
| Case analytics (by condition, outcome)      | P2       |
| Rich text editor for descriptions           | P2       |

---

## Phase 4: Growth (Future)

| Feature                             | Notes                 |
| ----------------------------------- | --------------------- |
| Multi-doctor collaboration on cases | Sharing & permissions |
| Patient self-check-in portal        | Public-facing form    |
| Templates for common conditions     | Speed up entry        |
| Voice-to-text for notes             | Mobile convenience    |
| AI summary of case timeline         | LLM integration       |
| FHIR/HL7 data export                | Interoperability      |

---

## Definition of Done (per feature)

- [ ] Feature works on Chrome, Safari, Edge (latest)
- [ ] Mobile responsive (tested on 375px width)
- [ ] Dark mode tested
- [ ] Form validation with error messages
- [ ] Loading states shown during async operations
- [ ] Security rules in place (own data only)
- [ ] No console errors

---

## Sprint Breakdown (MVP — Phase 1)

### Week 1: Foundation

- [ ] Vite + React + TypeScript project setup
- [ ] Tailwind CSS v4 + shadcn/ui installation
- [ ] React Router v7 route structure
- [ ] Firebase project creation & config
- [ ] Auth implementation (Google Sign-In)
- [ ] Layout shell: sidebar, header, mobile nav
- [ ] Theme toggle (light/dark/system)
- [ ] Doctor profile page

### Week 2: Core CRUD

- [ ] Create case form (patient + admission)
- [ ] Cases list page with search
- [ ] Case detail page layout
- [ ] Timeline entry form (dialog)
- [ ] Timeline display (chronological)
- [ ] Photo upload to Firebase Storage
- [ ] File attachment display in entries

### Week 3: Polish & Deploy

- [ ] Mobile responsive testing & fixes
- [ ] Loading states and error handling
- [ ] Firestore security rules
- [ ] Storage security rules
- [ ] PWA manifest + install banner (vite-plugin-pwa)
- [ ] Deploy to Vercel
- [ ] Share with doctor feedback group
