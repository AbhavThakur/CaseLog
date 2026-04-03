import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const auth = getAuth(app);
const storage = getStorage(app);

// IS_DEV flag: true when VITE_ENV=dev (controls dev-specific behavior like data prefixes)
export const IS_DEV = import.meta.env.VITE_ENV === "dev";

/**
 * Environment-aware collection/path prefix.
 * Dev uses "dev_" prefix so dev data never mixes with prod data
 * in the same Firebase project.
 */
const ENV_PREFIX = IS_DEV ? "dev_" : "";

/** Returns the prefixed collection name for the current environment */
export function col(name: string): string {
  // Only prefix top-level collections (doctors, counters, config)
  return `${ENV_PREFIX}${name}`;
}

/** Returns the prefixed storage path for the current environment */
export function storagePath(path: string): string {
  return `${ENV_PREFIX}${path}`;
}

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export { app, db, auth, storage };
