import { useEffect, useState, useCallback } from "react";
import { subscribeToCases } from "@/lib/firestore";
import type { PatientCase } from "@/lib/types";
import { useAuth } from "./useAuth";

export function useCases() {
  const { user } = useAuth();
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToCases(user.uid, (data) => {
      setCases(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setCases([]);
      setLoading(true);
    };
  }, [user]);

  const filterCases = useCallback(
    (search: string, status: string) => {
      let filtered = cases;

      if (status && status !== "all") {
        filtered = filtered.filter((c) => c.status === status);
      }

      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.patient.name.toLowerCase().includes(term) ||
            c.admission.initialDiagnosis.toLowerCase().includes(term) ||
            c.caseNumber.toLowerCase().includes(term) ||
            c.tags.some((t) => t.toLowerCase().includes(term)),
        );
      }

      return filtered;
    },
    [cases],
  );

  return { cases, loading, filterCases };
}
