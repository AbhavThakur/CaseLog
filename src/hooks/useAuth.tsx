import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User } from "firebase/auth";
import { onAuthChange } from "@/lib/auth";
import { getDoctor, createOrUpdateDoctor } from "@/lib/firestore";
import { seedDemoData } from "@/lib/demo-data";
import type { Doctor } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  loading: boolean;
  isAdmin: boolean;
  refreshDoctor: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  doctor: null,
  loading: true,
  isAdmin: false,
  refreshDoctor: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDoctor = async () => {
    if (!user) return;
    const doc = await getDoctor(user.uid);
    setDoctor(doc);
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if doctor profile exists
        let doc = await getDoctor(firebaseUser.uid);
        const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
        const isDemo = !!demoEmail && firebaseUser.email === demoEmail;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const shouldBeAdmin =
          !isDemo && !!adminEmail && firebaseUser.email === adminEmail;

        if (!doc) {
          // Auto-create profile from Google account data (or demo defaults)
          await createOrUpdateDoctor(firebaseUser.uid, {
            email: firebaseUser.email ?? (isDemo ? "demo@caselog.app" : ""),
            displayName: firebaseUser.displayName ?? (isDemo ? "Dr. Demo" : ""),
            ...(firebaseUser.photoURL
              ? { photoURL: firebaseUser.photoURL }
              : {}),
            specialization: isDemo ? "General Medicine" : "",
            hospital: isDemo ? "CaseLog Demo Hospital" : "",
            practiceType: isDemo ? "both" : "hospital",
            ...(shouldBeAdmin ? { isAdmin: true } : {}),
          });
          doc = await getDoctor(firebaseUser.uid);

          // Seed sample data for demo users
          if (isDemo) {
            seedDemoData(firebaseUser.uid).catch(console.error);
          }
        } else if (shouldBeAdmin && !doc.isAdmin) {
          // Existing user: promote to admin if email matches env var
          await createOrUpdateDoctor(firebaseUser.uid, { isAdmin: true });
          doc = await getDoctor(firebaseUser.uid);
        }
        setDoctor(doc);
      } else {
        setDoctor(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        doctor,
        loading,
        isAdmin: doctor?.isAdmin === true,
        refreshDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
