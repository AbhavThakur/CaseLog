import { Timestamp } from "firebase/firestore";

export interface Doctor {
  uid: string;
  email: string;
  displayName: string;
  specialization: string;
  hospital: string;
  practiceType: "hospital" | "clinic" | "both";
  isAdmin?: boolean;
  phone?: string;
  photoURL?: string;
  storageUsedBytes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PatientCase {
  id: string;
  caseNumber: string;
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
  admission: {
    date: Timestamp;
    chiefComplaint: string;
    initialDiagnosis: string;
    visitType: "ipd" | "opd";
    referredBy?: string;
    ward?: string;
    roomNumber?: string;
  };
  discharge?: {
    date: Timestamp;
    finalDiagnosis: string;
    treatmentSummary: string;
    outcome: "recovered" | "improved" | "LAMA" | "referred" | "expired";
    followUpInstructions?: string;
    medications?: string[];
  };
  status: "active" | "discharged" | "follow-up";
  tags: string[];
  isCaseStudy: boolean;
  ownerId: string;
  admissionPhotoURL?: string;
  fileCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TimelineEntry {
  id: string;
  type:
    | "observation"
    | "treatment"
    | "medication"
    | "procedure"
    | "lab-result"
    | "imaging"
    | "note"
    | "complication";
  title: string;
  description: string;
  priority: "normal" | "important" | "critical";
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    spO2?: number;
    respiratoryRate?: number;
    weight?: number;
  };
  attachments: {
    name: string;
    url: string;
    type: "image" | "pdf" | "document";
    size: number;
    storagePath: string;
  }[];
  entryDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VitalsRecord {
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

export interface Reminder {
  id: string;
  caseId: string;
  patientName: string;
  title: string;
  note?: string;
  dueDate: Timestamp;
  channel: "whatsapp" | "sms" | "in-app";
  phone?: string;
  status: "pending" | "sent" | "dismissed";
  createdAt: Timestamp;
}

export interface AppConfig {
  maxFilesPerCase: number;
  maxFileSizeMB: number;
  storageLimitGB: number;
  compressionQuality: number;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  updatedAt: Timestamp;
}
