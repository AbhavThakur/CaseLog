# 03 — Data Model & Schema

---

## Firestore Collection Structure

```
firestore/
├── doctors/{doctorId}                    # Doctor profile document
│   ├── cases/{caseId}                   # Patient case document
│   │   ├── timeline/{entryId}           # Timeline entries (subcollection)
│   │   └── vitals/{vitalId}             # Vitals snapshots (subcollection)
│   └── tags/                            # Doctor's custom tags (optional)
└── counters/caseCounter                 # Auto-increment case IDs
```

---

## Document Schemas

### Doctor Profile — `doctors/{doctorId}`

```typescript
interface Doctor {
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  specialization: string; // e.g., "Cardiology", "Orthopedics"
  hospital: string; // Hospital or clinic name
  phone?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Patient Case — `doctors/{doctorId}/cases/{caseId}`

```typescript
interface PatientCase {
  id: string; // Auto-generated Firestore ID
  caseNumber: string; // Human-readable: "CL-2026-0001"

  // Patient Demographics
  patient: {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    phone?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relation: string;
    };
  };

  // Admission Details
  admission: {
    date: Timestamp;
    chiefComplaint: string; // Primary reason for visit
    initialDiagnosis: string;
    referredBy?: string;
    ward?: string;
    roomNumber?: string;
  };

  // Discharge Details (filled on closure)
  discharge?: {
    date: Timestamp;
    finalDiagnosis: string;
    treatmentSummary: string;
    outcome: "recovered" | "improved" | "LAMA" | "referred" | "expired";
    followUpInstructions?: string;
    medications?: string[];
  };

  // Case Metadata
  status: "active" | "discharged" | "follow-up";
  tags: string[]; // e.g., ["diabetes", "cardiac", "ICU"]
  isCaseStudy: boolean; // Flagged for reference

  // Sharing (Phase 2 — optional multi-doctor view access)
  ownerId: string; // Firebase Auth UID of creator
  sharedWith?: string[]; // UIDs of doctors with read-only access

  // File References
  admissionPhotoURL?: string;
  fileCount: number; // Total attached files

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Timeline Entry — `doctors/{doctorId}/cases/{caseId}/timeline/{entryId}`

```typescript
interface TimelineEntry {
  id: string;

  // Entry Content
  type:
    | "observation"
    | "treatment"
    | "medication"
    | "procedure"
    | "lab-result"
    | "imaging"
    | "note"
    | "complication";
  title: string; // Short summary
  description: string; // Rich text / detailed notes

  // Importance
  priority: "normal" | "important" | "critical";

  // Optional Vitals Snapshot (quick-add with entry)
  vitals?: {
    bloodPressure?: string; // "120/80"
    pulse?: number; // bpm
    temperature?: number; // °F or °C
    spO2?: number; // percentage
    respiratoryRate?: number; // breaths/min
    weight?: number; // kg
  };

  // Attached Files
  attachments: {
    name: string;
    url: string; // Firebase Storage download URL
    type: "image" | "pdf" | "document";
    size: number; // bytes
    storagePath: string; // Firebase Storage path for deletion
  }[];

  // Timestamps
  entryDate: Timestamp; // When the event occurred (may differ from creation)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Vitals Record — `doctors/{doctorId}/cases/{caseId}/vitals/{vitalId}`

```typescript
interface VitalsRecord {
  id: string;
  recordedAt: Timestamp;

  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulse?: number;
  temperature?: number;
  spO2?: number;
  respiratoryRate?: number;
  weight?: number;
  bloodSugar?: number;

  notes?: string;
  createdAt: Timestamp;
}
```

---

## Firebase Storage Structure

```
firebase-storage/
└── cases/
    └── {doctorId}/
        └── {caseId}/
            ├── admission/
            │   └── photo.jpg
            ├── timeline/
            │   └── {entryId}/
            │       ├── xray-001.jpg
            │       ├── lab-report.pdf
            │       └── wound-photo.jpg
            └── discharge/
                └── summary-report.pdf
```

### Storage Rules

- Max file size: **10 MB** per file (configurable)
- Accepted types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Client-side compression for images > 2 MB (resize to max 1920px width)
- Files named with UUID to prevent collisions

---

## Indexing Strategy (Firestore)

### Required Composite Indexes

| Collection | Fields                                       | Purpose                     |
| ---------- | -------------------------------------------- | --------------------------- |
| `cases`    | `status` + `createdAt` (desc)                | Active cases sorted by date |
| `cases`    | `tags` (array-contains) + `createdAt` (desc) | Filter by tag               |
| `cases`    | `isCaseStudy` + `createdAt` (desc)           | Case study list             |
| `cases`    | `patient.name` + `createdAt` (desc)          | Search by patient           |
| `timeline` | `type` + `entryDate` (desc)                  | Filter timeline by type     |
| `timeline` | `priority` + `entryDate` (desc)              | Critical entries first      |
| `vitals`   | `recordedAt` (asc)                           | Vitals chart data           |

---

## Zod Validation Schemas (for forms)

```typescript
// schemas.ts
import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.number().min(0).max(150),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  phone: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relation: z.string(),
    })
    .optional(),
});

export const admissionSchema = z.object({
  date: z.date(),
  chiefComplaint: z.string().min(5, "Describe the chief complaint"),
  initialDiagnosis: z.string().min(3, "Initial diagnosis required"),
  referredBy: z.string().optional(),
  ward: z.string().optional(),
  roomNumber: z.string().optional(),
});

export const timelineEntrySchema = z.object({
  type: z.enum([
    "observation",
    "treatment",
    "medication",
    "procedure",
    "lab-result",
    "imaging",
    "note",
    "complication",
  ]),
  title: z.string().min(3, "Title required"),
  description: z.string().min(1),
  priority: z.enum(["normal", "important", "critical"]).default("normal"),
  entryDate: z.date(),
  vitals: z
    .object({
      bloodPressure: z.string().optional(),
      pulse: z.number().optional(),
      temperature: z.number().optional(),
      spO2: z.number().min(0).max(100).optional(),
      respiratoryRate: z.number().optional(),
      weight: z.number().optional(),
    })
    .optional(),
});

export const dischargeSchema = z.object({
  date: z.date(),
  finalDiagnosis: z.string().min(3),
  treatmentSummary: z.string().min(10),
  outcome: z.enum(["recovered", "improved", "LAMA", "referred", "expired"]),
  followUpInstructions: z.string().optional(),
  medications: z.array(z.string()).optional(),
});
```

---

## Data Relationships Diagram

```
Doctor (1)
  │
  ├── has many ──► Cases (N)
  │                  │
  │                  ├── has many ──► Timeline Entries (N)
  │                  │                  │
  │                  │                  └── has many ──► Attachments (N)
  │                  │                       (stored in Firebase Storage)
  │                  │
  │                  └── has many ──► Vitals Records (N)
  │
  └── has ──► Profile (1)
```
