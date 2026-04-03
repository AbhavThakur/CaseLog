# 01 — Requirements & User Stories

---

## User Roles

| Role                      | Description                          | Access                 |
| ------------------------- | ------------------------------------ | ---------------------- |
| **Doctor (Primary)**      | Logs and manages patient cases       | Full CRUD on own cases |
| **Doctor (Collaborator)** | Invited to view/contribute to a case | Read + limited write   |
| **Admin** (future)        | Manages doctor accounts, settings    | System-wide access     |

---

## Functional Requirements

### FR-01: Authentication & Profile

- [ ] Google Sign-In (Firebase Auth)
- [ ] Email/Password sign-in (fallback)
- [ ] Doctor profile: name, specialization, hospital/clinic, photo
- [ ] Session management with secure tokens

### FR-02: Patient Admission / Case Creation

- [ ] Create new patient case with:
  - Patient name, age, gender, blood group
  - Contact info (phone, emergency contact)
  - Admission date & time
  - Chief complaint / reason for admission
  - Initial diagnosis
  - Referring doctor (optional)
  - Ward / room assignment
- [ ] Auto-generate unique Case ID (e.g., `CL-2026-0001`)
- [ ] Attach admission photo (optional)

### FR-03: Patient Timeline / Progress Logging

- [ ] Add timeline entries with:
  - Date & time (auto or manual)
  - Entry type: `observation`, `treatment`, `medication`, `procedure`, `lab-result`, `imaging`, `note`, `complication`
  - Free-text description (rich text)
  - Attach files: photos, PDFs, lab reports, scan images
  - Vitals snapshot: BP, pulse, temperature, SpO2, weight (optional per entry)
  - Mark as "important" or "critical"
- [ ] Timeline displayed chronologically (newest first option)
- [ ] Filter timeline by entry type
- [ ] Edit / delete own entries

### FR-04: Patient Progress Tracking

- [ ] Visual progress indicators:
  - Vitals chart over time (line/area chart)
  - Status badges: `Admitted` → `In Treatment` → `Improving` → `Discharged`
  - Medication tracking timeline
- [ ] Summary view showing key milestones
- [ ] Flag deterioration or critical changes

### FR-05: Discharge & Case Closure

- [ ] Record discharge details:
  - Discharge date & time
  - Final diagnosis
  - Treatment summary
  - Outcome: `recovered`, `improved`, `LAMA`, `referred`, `expired`
  - Follow-up instructions
  - Discharge medications
- [ ] Mark case as `closed`
- [ ] Post-discharge follow-up entries (optional)

### FR-06: Case Search & Reference

- [ ] Search cases by:
  - Patient name
  - Diagnosis / condition
  - Date range
  - Case status (active / closed)
  - Tags / keywords
- [ ] Tag cases with conditions (e.g., `diabetes`, `cardiac`, `trauma`)
- [ ] Mark cases as "case study" for easy reference
- [ ] View statistics: total cases, by condition, by outcome

### FR-07: File & Photo Management

- [ ] Upload photos (clinical images, wounds, X-rays, scans)
- [ ] Upload documents (PDF lab reports, referral letters)
- [ ] Image compression before upload (client-side)
- [ ] Gallery view per case
- [ ] Download / export files

### FR-08: PWA Capabilities

- [ ] Install as app on mobile/tablet
- [ ] Offline access to viewed cases (read-only cache)
- [ ] Queue entries when offline → sync when online
- [ ] Push notifications for collaborator updates (future)

### FR-09: Export & Sharing (Phase 2)

- [ ] Export case as PDF report
- [ ] Export to Google Drive folder
- [ ] Share read-only link to a case
- [ ] Print-friendly case summary

---

## Non-Functional Requirements

| ID     | Requirement       | Target                                                                          |
| ------ | ----------------- | ------------------------------------------------------------------------------- |
| NFR-01 | **Performance**   | Page load < 2s, timeline entry < 1s                                             |
| NFR-02 | **Security**      | HTTPS only, Firebase Security Rules, no PII in URLs                             |
| NFR-03 | **Data Privacy**  | Patient data encrypted at rest (Firestore default), access scoped to case owner |
| NFR-04 | **Availability**  | 99.9% uptime (Firebase SLA)                                                     |
| NFR-05 | **Scalability**   | Support 100+ doctors, 10,000+ cases                                             |
| NFR-06 | **Accessibility** | WCAG 2.1 AA compliance, keyboard navigable                                      |
| NFR-07 | **Mobile**        | Responsive, works on 360px+ screens                                             |
| NFR-08 | **Offline**       | Read-only cache for last 20 viewed cases                                        |
| NFR-09 | **Compliance**    | Follow local data protection guidelines (advise doctors on patient consent)     |

---

## User Stories

### Doctor (Primary User)

```
US-01: As a doctor, I want to create a new patient case when admitting a patient,
       so I have a structured record from day one.

US-02: As a doctor, I want to add daily observations, treatments, and photos to the
       patient timeline, so I have a complete history.

US-03: As a doctor, I want to track vitals over time on a chart, so I can visually
       see patient progress.

US-04: As a doctor, I want to search my past cases by diagnosis, so I can reference
       similar cases for current treatment decisions.

US-05: As a doctor, I want to close a case with discharge details, so I have a
       complete case record.

US-06: As a doctor, I want to use this tool on my phone/tablet in the ward, so I
       can log entries at the bedside.

US-07: As a doctor, I want to attach clinical photos to timeline entries, so visual
       documentation is linked to the right context.

US-08: As a doctor, I want to mark certain cases as "case study", so I can easily
       find them for teaching or academic purposes.

US-09: As a doctor, I want to access my recent cases even when offline, so I can
       review patient information without Wi-Fi.

US-10: As a doctor, I want to export a case as a PDF, so I can share it in a
       clinical meeting or publication.
```

---

## Out of Scope (V1)

- Patient self-service portal
- Billing / insurance integration
- Prescription generation (e-prescribing)
- Lab system integration (HL7/FHIR)
- Multi-hospital / multi-tenant admin
- Video consultation
- AI-powered diagnosis suggestions

These can be considered for future versions after validating the core MVP with doctors.
