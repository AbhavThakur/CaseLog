import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  runTransaction,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db, col } from "./firebase";
import type {
  PatientCase,
  TimelineEntry,
  VitalsRecord,
  Doctor,
  Reminder,
  AppConfig,
} from "./types";
import { generateCaseNumber } from "./utils";

// ─── Doctor Profile ───

export async function getDoctor(uid: string): Promise<Doctor | null> {
  const snap = await getDoc(doc(db, col("doctors"), uid));
  return snap.exists() ? ({ ...snap.data(), uid: snap.id } as Doctor) : null;
}

export async function createOrUpdateDoctor(
  uid: string,
  data: Partial<Doctor>,
): Promise<void> {
  const ref = doc(db, col("doctors"), uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(ref, {
      ...data,
      uid,
      storageUsedBytes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// ─── Cases ───

function casesRef(doctorId: string) {
  return collection(db, col("doctors"), doctorId, "cases");
}

export async function createCase(
  doctorId: string,
  data: {
    patient: PatientCase["patient"];
    admission: Omit<PatientCase["admission"], "date">;
    investigations?: PatientCase["investigations"];
    tags?: string[];
  },
): Promise<string> {
  const counterRef = doc(db, col("counters"), "caseCounter");
  let caseNumber = "";

  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const currentCount = counterDoc.exists()
      ? (counterDoc.data().count as number)
      : 0;
    const newCount = currentCount + 1;
    caseNumber = generateCaseNumber(newCount);

    if (counterDoc.exists()) {
      transaction.update(counterRef, { count: newCount });
    } else {
      transaction.set(counterRef, { count: newCount });
    }
  });

  const docRef = await addDoc(casesRef(doctorId), {
    patient: data.patient,
    admission: { ...data.admission, date: Timestamp.now() },
    ...(data.investigations ? { investigations: data.investigations } : {}),
    tags: data.tags ?? [],
    status: "active",
    isCaseStudy: false,
    ownerId: doctorId,
    caseNumber,
    fileCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getCase(
  doctorId: string,
  caseId: string,
): Promise<PatientCase | null> {
  const snap = await getDoc(doc(db, col("doctors"), doctorId, "cases", caseId));
  return snap.exists()
    ? ({ ...snap.data(), id: snap.id } as PatientCase)
    : null;
}

export function subscribeToCases(
  doctorId: string,
  callback: (cases: PatientCase[]) => void,
  filters?: { status?: string; search?: string },
): Unsubscribe {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (filters?.status && filters.status !== "all") {
    constraints.unshift(where("status", "==", filters.status));
  }

  const q = query(casesRef(doctorId), ...constraints);

  return onSnapshot(q, (snapshot) => {
    let cases = snapshot.docs.map(
      (d) => ({ ...d.data(), id: d.id }) as PatientCase,
    );

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.patient.name.toLowerCase().includes(term) ||
          c.admission.initialDiagnosis.toLowerCase().includes(term) ||
          c.caseNumber.toLowerCase().includes(term) ||
          c.tags.some((t) => t.toLowerCase().includes(term)),
      );
    }

    callback(cases);
  });
}

export function subscribeToCase(
  doctorId: string,
  caseId: string,
  callback: (c: PatientCase | null) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, col("doctors"), doctorId, "cases", caseId),
    (snap) => {
      callback(
        snap.exists() ? ({ ...snap.data(), id: snap.id } as PatientCase) : null,
      );
    },
  );
}

export async function updateCase(
  doctorId: string,
  caseId: string,
  data: Partial<PatientCase>,
): Promise<void> {
  await updateDoc(doc(db, col("doctors"), doctorId, "cases", caseId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function dischargeCase(
  doctorId: string,
  caseId: string,
  discharge: Omit<NonNullable<PatientCase["discharge"]>, "date">,
): Promise<void> {
  await updateDoc(doc(db, col("doctors"), doctorId, "cases", caseId), {
    discharge: { ...discharge, date: Timestamp.now() },
    status: "discharged",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCase(
  doctorId: string,
  caseId: string,
): Promise<void> {
  await deleteDoc(doc(db, col("doctors"), doctorId, "cases", caseId));
}

export async function searchCases(
  doctorId: string,
  searchTerm: string,
  statusFilter?: string,
): Promise<PatientCase[]> {
  let q = query(casesRef(doctorId), orderBy("createdAt", "desc"));

  if (statusFilter && statusFilter !== "all") {
    q = query(
      casesRef(doctorId),
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc"),
    );
  }

  const snapshot = await getDocs(q);
  const cases = snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as PatientCase,
  );

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    return cases.filter(
      (c) =>
        c.patient.name.toLowerCase().includes(term) ||
        c.admission.initialDiagnosis.toLowerCase().includes(term) ||
        c.admission.chiefComplaint.toLowerCase().includes(term) ||
        c.caseNumber.toLowerCase().includes(term) ||
        c.tags.some((t) => t.toLowerCase().includes(term)),
    );
  }

  return cases;
}

// ─── Timeline Entries ───

function timelineRef(doctorId: string, caseId: string) {
  return collection(db, col("doctors"), doctorId, "cases", caseId, "timeline");
}

export async function addTimelineEntry(
  doctorId: string,
  caseId: string,
  data: Omit<TimelineEntry, "id" | "createdAt" | "updatedAt" | "entryDate">,
): Promise<string> {
  const docRef = await addDoc(timelineRef(doctorId, caseId), {
    ...data,
    entryDate: Timestamp.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update case file count
  const caseRef = doc(db, col("doctors"), doctorId, "cases", caseId);
  const caseSnap = await getDoc(caseRef);
  if (caseSnap.exists()) {
    const currentCount = caseSnap.data().fileCount ?? 0;
    await updateDoc(caseRef, {
      fileCount: currentCount + (data.attachments?.length ?? 0),
      updatedAt: serverTimestamp(),
    });
  }

  // Track storage bytes on the doctor profile
  const totalBytes = (data.attachments ?? []).reduce(
    (sum, a) => sum + a.size,
    0,
  );
  if (totalBytes > 0) {
    await updateStorageUsage(doctorId, totalBytes);
  }

  return docRef.id;
}

export function subscribeToTimeline(
  doctorId: string,
  caseId: string,
  callback: (entries: TimelineEntry[]) => void,
  typeFilter?: string,
): Unsubscribe {
  const constraints: QueryConstraint[] = [orderBy("entryDate", "desc")];

  if (typeFilter && typeFilter !== "all") {
    constraints.unshift(where("type", "==", typeFilter));
  }

  const q = query(timelineRef(doctorId, caseId), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(
      (d) => ({ ...d.data(), id: d.id }) as TimelineEntry,
    );
    callback(entries);
  });
}

export async function deleteTimelineEntry(
  doctorId: string,
  caseId: string,
  entryId: string,
): Promise<void> {
  await deleteDoc(
    doc(db, col("doctors"), doctorId, "cases", caseId, "timeline", entryId),
  );
}

export async function updateTimelineEntry(
  doctorId: string,
  caseId: string,
  entryId: string,
  data: Partial<
    Omit<TimelineEntry, "id" | "createdAt" | "updatedAt" | "entryDate">
  >,
): Promise<void> {
  await updateDoc(
    doc(db, col("doctors"), doctorId, "cases", caseId, "timeline", entryId),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
  );
}

// ─── Analytics ───

export interface AnalyticsData {
  casesByTag: { tag: string; count: number }[];
  casesByOutcome: { outcome: string; count: number }[];
  casesByMonth: { month: string; count: number }[];
  casesByStatus: { status: string; count: number }[];
  avgStayDays: number;
  totalPatients: number;
  caseStudyCount: number;
  visitTypeSplit: { ipd: number; opd: number };
}

export async function getAnalyticsData(
  doctorId: string,
): Promise<AnalyticsData> {
  const snap = await getDocs(casesRef(doctorId));
  const cases = snap.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as PatientCase,
  );

  // By tag
  const tagMap = new Map<string, number>();
  for (const c of cases) {
    for (const t of c.tags) {
      tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
    }
  }
  const casesByTag = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // By outcome
  const outcomeMap = new Map<string, number>();
  for (const c of cases) {
    if (c.discharge?.outcome) {
      const o = c.discharge.outcome;
      outcomeMap.set(o, (outcomeMap.get(o) ?? 0) + 1);
    }
  }
  const casesByOutcome = Array.from(outcomeMap.entries()).map(
    ([outcome, count]) => ({ outcome, count }),
  );

  // By month (last 12 months)
  const monthMap = new Map<string, number>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, 0);
  }
  for (const c of cases) {
    if (c.createdAt) {
      const d = c.createdAt.toDate();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
      }
    }
  }
  const casesByMonth = Array.from(monthMap.entries()).map(([month, count]) => ({
    month,
    count,
  }));

  // By status
  const statusMap = new Map<string, number>();
  for (const c of cases) {
    statusMap.set(c.status, (statusMap.get(c.status) ?? 0) + 1);
  }
  const casesByStatus = Array.from(statusMap.entries()).map(
    ([status, count]) => ({ status, count }),
  );

  // Average stay
  let totalDays = 0;
  let stayCount = 0;
  for (const c of cases) {
    if (c.discharge?.date && c.admission?.date) {
      const admDate = c.admission.date.toDate();
      const disDate = c.discharge.date.toDate();
      totalDays += (disDate.getTime() - admDate.getTime()) / 86400000;
      stayCount++;
    }
  }

  // Visit type
  let ipd = 0;
  let opd = 0;
  for (const c of cases) {
    if (c.admission.visitType === "ipd") ipd++;
    else opd++;
  }

  return {
    casesByTag,
    casesByOutcome,
    casesByMonth,
    casesByStatus,
    avgStayDays: stayCount > 0 ? Math.round(totalDays / stayCount) : 0,
    totalPatients: cases.length,
    caseStudyCount: cases.filter((c) => c.isCaseStudy).length,
    visitTypeSplit: { ipd, opd },
  };
}

// ─── Vitals ───

function vitalsRef(doctorId: string, caseId: string) {
  return collection(db, col("doctors"), doctorId, "cases", caseId, "vitals");
}

export async function addVitals(
  doctorId: string,
  caseId: string,
  data: Omit<VitalsRecord, "id" | "createdAt">,
): Promise<string> {
  const docRef = await addDoc(vitalsRef(doctorId, caseId), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToVitals(
  doctorId: string,
  caseId: string,
  callback: (vitals: VitalsRecord[]) => void,
): Unsubscribe {
  const q = query(vitalsRef(doctorId, caseId), orderBy("recordedAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const vitals = snapshot.docs.map(
      (d) => ({ ...d.data(), id: d.id }) as VitalsRecord,
    );
    callback(vitals);
  });
}

// ─── Stats ───

export interface DashboardStats {
  activeCases: number;
  totalCases: number;
  todayEntries: number;
  caseStudies: number;
  followUpCases: number;
  dischargedCases: number;
  criticalEntriesToday: number;
  thisWeekNewCases: number;
  thisMonthNewCases: number;
  lastEntryTime: Date | null;
  recentActivity: {
    caseId: string;
    caseNumber: string;
    patientName: string;
    entryTitle: string;
    entryType: string;
    time: Date;
  }[];
}

export async function getDashboardStats(
  doctorId: string,
): Promise<DashboardStats> {
  const casesSnap = await getDocs(casesRef(doctorId));
  const cases = casesSnap.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as PatientCase,
  );

  const activeCases = cases.filter((c) => c.status === "active").length;
  const followUpCases = cases.filter((c) => c.status === "follow-up").length;
  const dischargedCases = cases.filter((c) => c.status === "discharged").length;
  const caseStudies = cases.filter((c) => c.isCaseStudy).length;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekNewCases = cases.filter(
    (c) => c.createdAt && c.createdAt.toDate() >= weekAgo,
  ).length;
  const thisMonthNewCases = cases.filter(
    (c) => c.createdAt && c.createdAt.toDate() >= monthStart,
  ).length;

  let todayEntries = 0;
  let criticalEntriesToday = 0;
  let lastEntryTime: Date | null = null;
  const recentActivity: DashboardStats["recentActivity"] = [];

  for (const caseDoc of casesSnap.docs) {
    const caseData = caseDoc.data() as PatientCase;

    const entriesSnap = await getDocs(
      query(
        collection(
          db,
          col("doctors"),
          doctorId,
          "cases",
          caseDoc.id,
          "timeline",
        ),
        where("createdAt", ">=", todayTimestamp),
      ),
    );
    todayEntries += entriesSnap.size;

    for (const entryDoc of entriesSnap.docs) {
      const entry = entryDoc.data();
      if (entry.priority === "critical") criticalEntriesToday++;
      const entryTime = entry.createdAt?.toDate?.() ?? new Date();
      if (!lastEntryTime || entryTime > lastEntryTime) {
        lastEntryTime = entryTime;
      }
      recentActivity.push({
        caseId: caseDoc.id,
        caseNumber: caseData.caseNumber ?? "",
        patientName: caseData.patient?.name ?? "",
        entryTitle: entry.title ?? "",
        entryType: entry.type ?? "note",
        time: entryTime,
      });
    }
  }

  // Sort recent activity by time desc, keep top 5
  recentActivity.sort((a, b) => b.time.getTime() - a.time.getTime());
  recentActivity.splice(5);

  return {
    activeCases,
    totalCases: cases.length,
    todayEntries,
    caseStudies,
    followUpCases,
    dischargedCases,
    criticalEntriesToday,
    thisWeekNewCases,
    thisMonthNewCases,
    lastEntryTime,
    recentActivity,
  };
}

// ─── Reminders ───

function remindersRef(doctorId: string) {
  return collection(db, col("doctors"), doctorId, "reminders");
}

export async function addReminder(
  doctorId: string,
  data: Omit<Reminder, "id" | "createdAt" | "status">,
): Promise<string> {
  const docRef = await addDoc(remindersRef(doctorId), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToReminders(
  doctorId: string,
  callback: (reminders: Reminder[]) => void,
): Unsubscribe {
  const q = query(
    remindersRef(doctorId),
    where("status", "==", "pending"),
    orderBy("dueDate", "asc"),
  );

  return onSnapshot(q, (snapshot) => {
    const reminders = snapshot.docs.map(
      (d) => ({ ...d.data(), id: d.id }) as Reminder,
    );
    callback(reminders);
  });
}

export async function dismissReminder(
  doctorId: string,
  reminderId: string,
): Promise<void> {
  await updateDoc(doc(db, col("doctors"), doctorId, "reminders", reminderId), {
    status: "dismissed",
  });
}

// ─── Storage Tracking ───

export async function updateStorageUsage(
  doctorId: string,
  bytesAdded: number,
): Promise<void> {
  const ref = doc(db, col("doctors"), doctorId);
  const snap = await getDoc(ref);
  const current = snap.exists()
    ? ((snap.data().storageUsedBytes ?? 0) as number)
    : 0;
  await updateDoc(ref, {
    storageUsedBytes: current + bytesAdded,
    updatedAt: serverTimestamp(),
  });
}

export async function getStorageUsage(doctorId: string): Promise<number> {
  const snap = await getDoc(doc(db, col("doctors"), doctorId));
  return snap.exists() ? ((snap.data().storageUsedBytes ?? 0) as number) : 0;
}

// ─── Admin: App Config ───

const CONFIG_DOC = doc(db, col("config"), "app");

export async function getAppConfig(): Promise<AppConfig | null> {
  const snap = await getDoc(CONFIG_DOC);
  return snap.exists() ? (snap.data() as AppConfig) : null;
}

export async function updateAppConfig(
  data: Partial<Omit<AppConfig, "updatedAt">>,
): Promise<void> {
  const snap = await getDoc(CONFIG_DOC);
  if (snap.exists()) {
    await updateDoc(CONFIG_DOC, { ...data, updatedAt: serverTimestamp() });
  } else {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(CONFIG_DOC, {
      maxFilesPerCase: 50,
      maxFileSizeMB: 5,
      storageLimitGB: 1,
      compressionQuality: 0.82,
      allowNewRegistrations: true,
      maintenanceMode: false,
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeToAppConfig(
  callback: (config: AppConfig | null) => void,
): Unsubscribe {
  return onSnapshot(CONFIG_DOC, (snap) => {
    callback(snap.exists() ? (snap.data() as AppConfig) : null);
  });
}

// ─── Admin: All Doctors ───

export async function getAllDoctors(): Promise<Doctor[]> {
  const snapshot = await getDocs(collection(db, col("doctors")));
  return snapshot.docs.map((d) => ({ ...d.data(), uid: d.id }) as Doctor);
}

export async function setDoctorAdmin(
  doctorId: string,
  isAdmin: boolean,
): Promise<void> {
  await updateDoc(doc(db, col("doctors"), doctorId), {
    isAdmin,
    updatedAt: serverTimestamp(),
  });
}

// ─── Shareable Links ───

export interface SharedCaseData {
  doctorId: string;
  caseId: string;
  doctorName: string;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}

export async function createShareLink(
  doctorId: string,
  caseId: string,
  doctorName: string,
  expiresInDays?: number,
): Promise<string> {
  // Check if a share link already exists
  const q = query(
    collection(db, col("shared_cases")),
    where("doctorId", "==", doctorId),
    where("caseId", "==", caseId),
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    return existing.docs[0]!.id;
  }

  const expiresAt = expiresInDays
    ? Timestamp.fromDate(
        new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      )
    : null;

  const docRef = await addDoc(collection(db, col("shared_cases")), {
    doctorId,
    caseId,
    doctorName,
    expiresAt,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSharedCase(shareId: string): Promise<{
  case: PatientCase;
  timeline: TimelineEntry[];
  sharedBy: string;
} | null> {
  const shareSnap = await getDoc(doc(db, col("shared_cases"), shareId));
  if (!shareSnap.exists()) return null;

  const shareData = shareSnap.data() as SharedCaseData;

  // Check expiry
  if (shareData.expiresAt) {
    const expires = shareData.expiresAt.toDate();
    if (expires < new Date()) return null;
  }

  const caseSnap = await getDoc(
    doc(db, col("doctors"), shareData.doctorId, "cases", shareData.caseId),
  );
  if (!caseSnap.exists()) return null;

  const caseData = { ...caseSnap.data(), id: caseSnap.id } as PatientCase;

  const timelineSnap = await getDocs(
    query(
      collection(
        db,
        col("doctors"),
        shareData.doctorId,
        "cases",
        shareData.caseId,
        "timeline",
      ),
      orderBy("entryDate", "desc"),
    ),
  );
  const timeline = timelineSnap.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as TimelineEntry,
  );

  return { case: caseData, timeline, sharedBy: shareData.doctorName };
}

export async function revokeShareLink(shareId: string): Promise<void> {
  await deleteDoc(doc(db, col("shared_cases"), shareId));
}
